import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader, JSONLoader
from dotenv import load_dotenv
from langchain_text_splitters import CharacterTextSplitter

load_dotenv()
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

def load_data():
    loader_neural = JSONLoader(
        file_path="data/neural.json",
        jq_schema=".[]",
        text_content=False,
    )
    loader_heart = JSONLoader(
        file_path="data/heart.json",
        jq_schema=".[]",
        text_content=False,
    )
    loader_heart1 = JSONLoader(
        file_path="circulatory.json",
        jq_schema=".[]",
        text_content=False,
    )
    loader_neural1 = JSONLoader(
        file_path="nervous.json",
        jq_schema=".[]",
        text_content=False,
    )
    return loader_neural.load() + loader_heart.load() + loader_heart1.load() + loader_neural1.load()

# def split_documents(documents, chunk_size=20, chunk_overlap=10):
#     print("Splitting documents...")
#     text_splitter = CharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)

#     chunks = text_splitter.split_documents(documents)

#     if chunks:
#         for i, chunk in enumerate(chunks):
#             print(f"Chunk {i+1}: {chunk.page_content}")

#         return chunks

from collections import defaultdict
import json
import tiktoken
import uuid


def _record(item):
    """Normalize a LangChain Document or dict row to a dict."""
    if hasattr(item, "page_content"):
        return json.loads(item.page_content)
    return item


def dict_to_text(d):
    d = _record(d)
    topic = d.get("topic") or d.get("process") or d.get("concept") or "unknown"
    text = d.get("text") or ""
    return f"{topic}: {text}"


def get_token_count(text, model="gpt-4"):
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))


def split_documents(data, max_tokens=300):
    """
    Hybrid semantic + token-aware chunking
    """
    
    # Step 1: Group by topic
    topic_groups = defaultdict(list)
    for d in data:
        row = _record(d)
        topic = row.get("topic") or row.get("process") or row.get("concept") or "unknown"
        topic_groups[topic].append(row)

    chunks = []

    # Step 2: Build chunks
    for topic, items in topic_groups.items():
        current_text = ""
        current_tags = set()
        organ = items[0].get("organ") or "unknown"

        for item in items:
            text_piece = dict_to_text(item)

            if get_token_count(current_text + text_piece) > max_tokens:
                # finalize chunk
                tags = sorted(current_tags) if current_tags else ["concept"]
                chunks.append({
                    "chunk_id": str(uuid.uuid4()),
                    "organ": organ,
                    "topic": topic,
                    "text": current_text.strip(),
                    "tags": tags,
                })

                current_text = ""
                current_tags = set()

            current_text += text_piece + "\n"
            current_tags.update(item.get("tags") or [])

        if current_text:
            tags = sorted(current_tags) if current_tags else ["concept"]
            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "organ": organ,
                "topic": topic,
                "text": current_text.strip(),
                "tags": tags,
            })

    return chunks
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

def load_vector_store(persist_directory="db/chroma_db"):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        cache_folder="./models"  # load from local folder
    )
    vector_store = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings,
    )
    return vector_store

def create_vector_store(chunks, persist_directory="db/chroma_db"):
    """
    Creates a Chroma vector store with MiniLM embeddings.

    Args:
        chunks (list): List of chunk dicts. Each chunk must include `text` and metadata fields.
        persist_directory (str): The path to persist the Chroma database.

    Returns:
        Chroma: The vector store instance.
    """
    # Use all-MiniLM-L6-v2 model from sentence-transformers
    embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    cache_folder="./models"  # load from local folder
    )
    texts = [chunk["text"] for chunk in chunks]
    metadatas = [{k: v for k, v in chunk.items() if k != "text"} for chunk in chunks]

    # Create or load the Chroma vector store
    print("Creating vector store...")
    vector_store = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        persist_directory=persist_directory,
    )
    print("Vector store created successfully")
    return vector_store





def main():
    print("Starting ingestion pipeline...")
    documents = load_data() # will return a list of langchain documents
    # print(documents)

    chunks = split_documents(documents) # will return a list of langchain documents

    vector_store = create_vector_store(chunks) # will return a vector store


    print(f"Loaded {len(documents)} documents")

    print(f"Split into {len(chunks)} chunks")
    # for i, chunk in enumerate(chunks):
    #     tags = ", ".join(chunk["tags"]) if chunk["tags"] else "(none)"
    #     print(f"[{i}] organ={chunk['organ']!r} | topic={chunk['topic']!r} | tags={tags}")
    #     print("-" * 48)

if __name__ == "__main__":
    main()