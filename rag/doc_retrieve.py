import os
import re
from dotenv import load_dotenv
from ingestion_pipeline import load_vector_store
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, util

load_dotenv()

# Load embedding model ONCE (avoid reload every query)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# -------------------------------
# QUERY ANALYSIS
# -------------------------------
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


# -------------------------------
# OPTIONAL: OLLAMA QUERY EXPANSION
# -------------------------------
def expand_query_ollama(query):
    """
    Expands query into multiple semantic variations using Ollama.
    Make sure ollama is running: `ollama run mistral`
    """
    try:
        import subprocess

        prompt = f"""
        Generate 3 short alternative search queries for:
        "{query}"
        Only return queries, one per line.
        """

        result = subprocess.run(
            ["ollama", "run", "mistral"],
            input=prompt,
            text=True,
            capture_output=True
        )

        variations = result.stdout.strip().split("\n")
        return [q.strip() for q in variations if q.strip()]

    except Exception:
        return [query]


# -------------------------------
# HYBRID SEARCH (VECTOR + BM25)
# -------------------------------
def hybrid_search(vector_store, query, k=5):
    # Vector search (MMR for diversity)
    vector_docs = vector_store.max_marginal_relevance_search(query, k=k, fetch_k=10)

    # Prepare BM25 corpus
    all_docs = vector_store.get()["documents"]
    tokenized_corpus = [doc.split() for doc in all_docs]
    bm25 = BM25Okapi(tokenized_corpus)

    tokenized_query = query.split()
    bm25_scores = bm25.get_scores(tokenized_query)

    top_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:k]
    keyword_docs = [all_docs[i] for i in top_indices]

    return vector_docs, keyword_docs


# -------------------------------
# DEDUPLICATION
# -------------------------------
def deduplicate(texts):
    seen = set()
    unique = []
    for t in texts:
        key = t.strip()
        if key not in seen:
            seen.add(key)
            unique.append(t)
    return unique


# -------------------------------
# RERANK USING EMBEDDINGS
# -------------------------------
def rerank(query, texts, top_k=5):
    query_emb = embedding_model.encode(query, convert_to_tensor=True)
    doc_embs = embedding_model.encode(texts, convert_to_tensor=True)

    scores = util.cos_sim(query_emb, doc_embs)[0]
    ranked = sorted(zip(texts, scores), key=lambda x: x[1], reverse=True)

    return [t for t, _ in ranked[:top_k]]


# -------------------------------
# MAIN RETRIEVAL FUNCTION
# -------------------------------
def query_vector_store(query, k=5, persist_directory="db/chroma_db"):
    vector_store = load_vector_store(persist_directory)

    # ---- Retrieval (your improved logic) ----
    expanded_queries = expand_query_ollama(query)

    if is_comparison_query(query):
        expanded_queries.extend(split_comparison_query(query))

    all_texts = []

    for q in expanded_queries:
        vector_docs, keyword_docs = hybrid_search(vector_store, q, k)

        for doc in vector_docs:
            all_texts.append(doc.page_content)

        all_texts.extend(keyword_docs)

    # Deduplicate
    all_texts = deduplicate(all_texts)

    # Rerank
    final_texts = rerank(query, all_texts, top_k=k)

    # ---- NEW: LLM FORMATTING ----
    final_answer = format_with_ollama(query, final_texts)

    return final_answer


#  using local llm to format the answer
import subprocess

def format_with_ollama(query, contexts):
    """
    Uses Ollama (local LLM) to generate structured answer.
    """

    context_text = "\n\n".join(contexts)

    prompt = f"""
You are an NCERT-aligned biology assistant for Class 11 students.


User Query:
{query}

Context:
{context_text}

Your task is to answer questions ONLY using the provided context from the vector database.

STRICT RULES:
1. Answer must be strictly based on NCERT concepts (Circulatory System and Neural Control & Coordination).
2. Do NOT add outside knowledge or assumptions.
3. If the answer is not present in the context, say:
   "This information is not available in the provided content."
4. Use simple, clear, exam-ready language.
5. Use correct NCERT terminology (e.g., depolarisation, repolarisation, afferent, efferent, etc.).
6. Avoid unnecessary advanced or research-level explanations.
7. Ensure scientific correctness (no wrong statements).
8. Keep answers concise but complete.

OUTPUT FORMAT RULES:
- Start with a direct answer (no fluff).
- Use bullet points or numbered steps if explanation is procedural.
- Highlight key terms where appropriate.
- Do NOT mention "context" or "database" in the answer.
-Only include information directly relevant to the question.
-Do not add extra definitions unless explicitly asked.
- If question is definition → give 2-3 line precise definition
- If question is process → explain step-by-step
- If comparison → give table format
-Answer ONLY what is asked.
-Do not explain the full process unless explicitly requested.
-If the question asks for a specific concept (e.g., polarisation), restrict the answer to that concept only.
---


Answer:
"""

    result = subprocess.run(
        ["ollama", "run", "mistral"],
        input=prompt,
        capture_output=True,
        text=True,
        encoding="utf-8",   # ✅ FIX
        errors="ignore"     # ✅ prevents crash
    )

    if result.stdout:
        return result.stdout.strip()
    else:
        return "⚠️ No response from Ollama. Check if model is running."

# -------------------------------
# CLI LOOP
def main():
    print("🚀 Advanced RAG Retrieval Started")

    while True:
        query = input("\nEnter your query (or 'exit'): ")

        if query.lower() in ["exit", "quit"]:
            break

        result = query_vector_store(query, k=5)

        print("\n🧠 Answer:\n")
        print(result)
        print("-" * 50)


if __name__ == "__main__":
    main()