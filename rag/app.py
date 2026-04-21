from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

def clean_response(text):
    """Remove ANSI escape codes and clean up the response"""
    # Remove ANSI escape sequences like [4D[K, [9D[K, etc.
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])|\[\d*[A-Za-z]|\[\d*;\d*[A-Za-z]|\[\??\d*[A-Za-z]')
    text = ansi_escape.sub('', text)
    
    # Remove remaining bracket patterns like [4D[K
    text = re.sub(r'\[\d*[A-Z]\[?[A-Z]?', '', text)
    text = re.sub(r'\[K', '', text)
    text = re.sub(r'\[\d+D', '', text)
    
    # Clean up duplicate words that may result from the escape codes
    # e.g., "prov provide" -> "provide"
    text = re.sub(r'\b(\w+)\s+\1\b', r'\1', text)
    
    # Fix broken table formatting
    text = re.sub(r'\|\s*\n\s*\|', '|\n|', text)
    
    return text.strip()

# Try importing the RAG pipeline
try:
    from retrieval_pipeline import query_vector_store
    print("Successfully imported retrieval_pipeline")
except ImportError as e:
    print(f"ERROR: Could not import retrieval_pipeline: {e}")
    query_vector_store = None

@app.route('/', methods=['GET'])
def home():
    return jsonify({'status': 'Server is running', 'rag_loaded': query_vector_store is not None})

conversation_history = []

@app.route('/chat', methods=['POST'])
def chat():
    global conversation_history
    
    if query_vector_store is None:
        return jsonify({'answer': 'Error: RAG pipeline not loaded. Check terminal for import errors.'}), 500
    
    data = request.json
    query = data.get('query', '')
    
    # Reset conversation if requested
    if data.get('reset'):
        conversation_history = []
        return jsonify({'answer': 'Conversation reset.'})
    
    try:
        # Query the RAG pipeline
        answer = query_vector_store(query, history=conversation_history)
        
        # Clean up ANSI codes and formatting issues
        answer = clean_response(answer)
        
        # Update history
        conversation_history.append(("Student", query))
        conversation_history.append(("Assistant", answer))
        
        return jsonify({'answer': answer})
    except Exception as e:
        print(f"Error in query_vector_store: {e}")
        return jsonify({'answer': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting RAG Chatbot Backend...")
    print("Make sure Ollama is running with: ollama serve")
    print("Server running at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
