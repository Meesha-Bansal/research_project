import os

os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
import re
import logging
import subprocess
from dotenv import load_dotenv
from ingestion_pipeline import load_vector_store
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, util


# CLEAN LOGGING (REMOVE NOISE)

from transformers import logging as hf_logging
hf_logging.set_verbosity_error()
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)

load_dotenv()

# Load embedding model
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2",
    cache_folder="./models"
)

from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2")
model.save("./models/sentence-transformers/all-MiniLM-L6-v2")
# QUERY ANALYSIS

def is_comparison_query(query):
    keywords = ["vs", "difference", "compare", "distinguish"]
    return any(k in query.lower() for k in keywords)


def split_comparison_query(query):
    query = query.lower()
    if "vs" in query:
        parts = query.split("vs")
    elif "difference between" in query:
        parts = query.replace("difference between", "").split("and")
    else:
        return [query]

    return [p.strip() for p in parts if p.strip()]


# QUERY EXPANSION (OPTIONAL)

def expand_query_ollama(query):
    try:
        prompt = f"""Generate 3 short alternative search queries:
{query}
Only return queries."""

        result = subprocess.run(
            ["ollama", "run", "llama3:instruct"],
            input=prompt,
            text=True,
            capture_output=True,
            encoding="utf-8",   # ✅ FIX
            errors="ignore" 
        )

        return [q.strip() for q in result.stdout.split("\n") if q.strip()]

    except Exception:
        return [query]



# HYBRID SEARCH (IMPROVED)

def hybrid_search(vector_store, query, k=5):
    vector_docs = vector_store.max_marginal_relevance_search(
        query, k=k, fetch_k=15  # ↑ increase diversity
    )

    all_docs = vector_store.get()["documents"]

    tokenized_corpus = [doc.split() for doc in all_docs]
    bm25 = BM25Okapi(tokenized_corpus)

    scores = bm25.get_scores(query.split())
    top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]

    keyword_docs = [all_docs[i] for i in top_indices]

    return vector_docs, keyword_docs



# STRONG DEDUPLICATION

def deduplicate_semantic(texts, threshold=0.85):
    unique = []

    for text in texts:
        is_duplicate = False
        for u in unique:
            sim = util.cos_sim(
                embedding_model.encode(text),
                embedding_model.encode(u)
            )
            if sim > threshold:
                is_duplicate = True
                break

        if not is_duplicate:
            unique.append(text)

    return unique


# -------------------------------
# RERANK
# -------------------------------
def rerank(query, texts, top_k=5):
    query_emb = embedding_model.encode(query, convert_to_tensor=True)
    doc_embs = embedding_model.encode(texts, convert_to_tensor=True)

    scores = util.cos_sim(query_emb, doc_embs)[0]
    ranked = sorted(zip(texts, scores), key=lambda x: x[1], reverse=True)

    return [t for t, _ in ranked[:top_k]]


# -------------------------------
# CLEAN FINAL OUTPUT (CRITICAL)
# -------------------------------
def clean_response(text):
    # Remove separators
    text = re.sub(r"-{3,}", "", text)

    # Remove duplicate blocks
    blocks = text.split("\n\n")
    seen = set()
    clean_blocks = []

    for b in blocks:
        key = b.strip()
        if key and key not in seen:
            seen.add(key)
            clean_blocks.append(b)

    text = "\n\n".join(clean_blocks)

    # Remove excessive newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


# -------------------------------
# CONVERSATIONAL HISTORY
# -------------------------------
MAX_HISTORY_TURNS = 6
MAX_HISTORY_CHARS = 1800


def build_history_snippet(history, max_turns=MAX_HISTORY_TURNS, max_chars=MAX_HISTORY_CHARS):
    if not history:
        return ""

    selected = history[-max_turns:]
    lines = [f"{role}: {text.strip()}" for role, text in selected]
    history_text = "\n".join(lines)

    if len(history_text) > max_chars:
        history_text = "...\n" + history_text[-max_chars:]

    return history_text


def get_last_student_query(history):
    for role, text in reversed(history):
        if role == "Student":
            return text.strip()
    return None


def get_last_assistant_answer(history):
    for role, text in reversed(history):
        if role == "Assistant":
            return text.strip()
    return None


def rewrite_follow_up_query(query, history):
    lower = query.lower().strip()
    last_student = get_last_student_query(history or [])

    exam_triggers = [
        "important topics",
        "important concepts",
        "unit test",
        "exam",
        "test prep",
        "syllabus",
        "key topics",
        "key concepts",
        "need to know",
        "must know",
        "important points",
    ]

    if last_student and any(trigger in lower for trigger in exam_triggers):
        if "previous" in lower or "last" in lower or "the previous" in lower or "this" in lower:
            return f"List the important concepts and topics students should study for unit tests and exams based on the previous question: {last_student}."
        return f"List the important concepts and topics students should study for unit tests and exams on the topic: {last_student or query}."

    if not history:
        return query

    edit_triggers = [
        "make it concise",
        "make it short",
        "shorten it",
        "shorten",
        "brief",
        "summarize",
        "summarise",
        "condense",
        "rephrase",
        "rewrite",
        "reword",
        "exam-specific",
        "exam specific",
    ]
    if any(trigger in lower for trigger in edit_triggers) and len(lower.split()) <= 8:
        if "exam" in lower:
            return f"Rewrite the previous answer to '{last_student}' in an exam-specific and concise way."
        if "concise" in lower or "short" in lower or "brief" in lower or "summarize" in lower or "condense" in lower:
            return f"Rewrite the previous answer to '{last_student}' concisely."
        if "rephrase" in lower or "rewrite" in lower or "reword" in lower:
            return f"Rephrase the previous answer to '{last_student}' clearly and concisely."

    return query


# -------------------------------
# LLM FORMATTING (STRICT)
# -------------------------------
def format_with_ollama(query, contexts, history=None):
    context_text = "\n\n".join(contexts)
    history_text = build_history_snippet(history or [])
    last_student = get_last_student_query(history or [])
    last_assistant = get_last_assistant_answer(history or [])
    history_block = f"Conversation history:\n{history_text}\n\n" if history_text else ""
    last_block = ""
    if last_student and last_assistant:
        last_block = f"Last student question: {last_student}\nLast assistant answer: {last_assistant}\n\n"

    prompt = f"""
You are an NCERT Class 11 Biology expert assistant.
This is a conversation between a student and the assistant.
Use ONLY the provided context, and use the previous conversation to answer follow-up questions correctly.

{history_block}{last_block}
If the current question is a follow-up instruction such as "make it concise", "make it exam-specific", "shorten it", "rephrase", or "summarize", rewrite the previous assistant answer accordingly and do not ask the student to clarify.
If the current question asks for important topics, key concepts, unit test preparation, or exam review, produce a concise bullet list of the most important concepts and topics supported by the provided context.
If the current question is a follow-up question about the same topic, infer the subject from the previous student question and answer.

Your task is to generate a HIGH-QUALITY, STRUCTURED answer using ONLY the provided context.

------------------------
RULES (STRICT)
------------------------
1. Use ONLY the given context. Do NOT use external knowledge.
2. Do NOT hallucinate or add new facts.
3. You MAY combine information from multiple context chunks.
4. You MAY rephrase for clarity, but do not change meaning.
5. If sufficient information is NOT available, say:
   "This information is not available in the provided content."
6. If this is a follow-up question, use the conversation history and the retrieved context together.

------------------------
RESPONSE FORMAT RULES
------------------------
- Detect the query type and respond accordingly:

1. If DEFINITION:
   → Give 2-4 line precise explanation

2. If PROCESS / MECHANISM:
   → Give STEP-WISE explanation (numbered steps)

3. If COMPARISON (e.g., vs, difference):
   → MUST return a TABLE format

4. If EXPLANATION:
   → Use bullet points + short paragraphs

------------------------
QUALITY RULES
------------------------
- Remove duplicate information
- Merge similar points
- Keep answer concise and exam-ready
- Use clear headings where helpful
- Maintain logical flow (especially for biological processes)
- If any part of the answer is not directly supported by context, DO NOT include it.
- Do NOT introduce new terms not present in context.
- If extra information is present in context but not relevant, IGNORE it.
- Prefer NCERT-level explanations; avoid advanced or extra details.
- Do NOT include specific structures (e.g., SCN, basal ganglia) unless explicitly present in the context.
------------------------
Current question:
{query}

------------------------
Context:
{context_text}

------------------------
Final Answer:
"""


    result = subprocess.run(
        ["ollama", "run", "llama3:instruct"],
        input=prompt,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore"
    )

    if result.stdout:
        return clean_response(result.stdout)
    else:
        return f"No response from Ollama.\nSTDERR: {result.stderr}\nReturn code: {result.returncode}"


# -------------------------------
# MAIN PIPELINE
# -------------------------------
def query_vector_store(query, history=None, k=5, persist_directory="db/chroma_db"):
    vector_store = load_vector_store(persist_directory)
    search_query = rewrite_follow_up_query(query, history or [])

    expanded_queries = expand_query_ollama(search_query)

    if is_comparison_query(search_query):
        expanded_queries.extend(split_comparison_query(search_query))

    all_texts = []

    for q in expanded_queries:
        vector_docs, keyword_docs = hybrid_search(vector_store, q, k)

        all_texts.extend([doc.page_content for doc in vector_docs])
        all_texts.extend(keyword_docs)

    #  KEY FIXES
    all_texts = deduplicate_semantic(all_texts)   # better dedup
    final_texts = rerank(search_query, all_texts, top_k=4)  # reduce clutter

    return format_with_ollama(query, final_texts, history=history)


# -------------------------------
# CLI LOOP
# -------------------------------
def main():
    print("Conversational RAG System Ready")
    history = []

    while True:
        query = input("\nEnter your query (or 'exit', 'reset'): ")

        if not query.strip():
            continue

        command = query.lower().strip()
        if command in ["exit", "quit"]:
            break
        if command == "reset":
            history.clear()
            print("Conversation history cleared.")
            continue

        result = query_vector_store(query, history=history)
        history.append(("Student", query))
        history.append(("Assistant", result))

        print("\n🧠 Answer:\n")
        print(result)


if __name__ == "__main__":
    main()
