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
            ["ollama", "run", "mistral"],
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
# LLM FORMATTING (STRICT)
# -------------------------------
def format_with_ollama(query, contexts):
    context_text = "\n\n".join(contexts)

    prompt = f"""
You are an NCERT Class 11 Biology expert assistant.

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
- Include ONLY information directly relevant to answering the query.
- Do NOT add general facts about related topics unless explicitly required.
- If extra information is present in context but not relevant, IGNORE it.
- Prefer NCERT-level explanations; avoid advanced or extra details.
- Do NOT include specific structures (e.g., SCN, basal ganglia) unless explicitly present in the context.
------------------------
Query:
{query}

------------------------
Context:
{context_text}

------------------------
Final Answer:
"""


    result = subprocess.run(
        ["ollama", "run", "mistral"],
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
def query_vector_store(query, k=5, persist_directory="db/chroma_db"):
    vector_store = load_vector_store(persist_directory)

    expanded_queries = expand_query_ollama(query)

    if is_comparison_query(query):
        expanded_queries.extend(split_comparison_query(query))

    all_texts = []

    for q in expanded_queries:
        vector_docs, keyword_docs = hybrid_search(vector_store, q, k)

        all_texts.extend([doc.page_content for doc in vector_docs])
        all_texts.extend(keyword_docs)

    #  KEY FIXES
    all_texts = deduplicate_semantic(all_texts)   # better dedup
    final_texts = rerank(query, all_texts, top_k=4)  # reduce clutter

    return format_with_ollama(query, final_texts)


# -------------------------------
# CLI LOOP
# -------------------------------
def main():
    print("Clean RAG System Ready")

    while True:
        query = input("\nEnter your query (or 'exit'): ")

        if query.lower() in ["exit", "quit"]:
            break

        result = query_vector_store(query)

        print("\n🧠 Answer:\n")
        print(result)


if __name__ == "__main__":
    main()