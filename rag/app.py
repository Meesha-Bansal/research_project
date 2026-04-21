import re
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Get the directory where app.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=BASE_DIR)
CORS(app)

# Try importing the RAG pipeline
try:
    from retrieval_pipeline import query_vector_store
    print("Successfully imported retrieval_pipeline")
except ImportError as e:
    print(f"ERROR: Could not import retrieval_pipeline: {e}")
    query_vector_store = None


def clean_and_format_response(text):
    """
    Post-process the LLM response to ensure clean formatting
    for the frontend to parse correctly.
    """
    if not text:
        return text
    
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Fix truncated/repeated words pattern like: "structur" "structure" or "lymp lymphocytes"
    text = re.sub(r'\b(\w{3,})\s+\1(\w+)', r'\1\2', text)
    
    # Fix quoted truncation pattern: word" "word  ->  word
    text = re.sub(r'(\w+)"\s*"(\1\w*)', r'\2', text)
    
    # Fix pattern like: "structur "structure" -> "structure"
    text = re.sub(r'"(\w+)\s+"(\1\w*)"', r'"\2"', text)
    
    # ===== RECONSTRUCT TABLES WITH WRAPPED LINES =====
    # This handles cases where table cell content wraps to next line
    lines = text.split('\n')
    reconstructed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Check if this is a table row (starts and ends with |)
        if stripped.startswith('|') and stripped.endswith('|'):
            # Count pipes to determine expected column count
            pipe_count = stripped.count('|')
            
            # Look ahead for continuation lines (lines that don't start with | but should be part of this row)
            while i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                
                # If next line is empty, another table row, or a separator, stop
                if not next_line or next_line.startswith('|') or next_line.startswith('-'):
                    break
                
                # This line is likely a continuation of the current cell
                # Append it to the current line (before the last |)
                stripped = stripped[:-1].rstrip() + ' ' + next_line + ' |'
                i += 1
            
            reconstructed_lines.append(stripped)
        else:
            reconstructed_lines.append(line)
        
        i += 1
    
    text = '\n'.join(reconstructed_lines)
    
    # ===== FIX TABLE SEPARATOR ROWS =====
    # Replace empty separator rows like |  |  |  | with proper |---|---|---|
    def fix_separator_row(match):
        row = match.group(0)
        # Count the cells
        cells = row.split('|')
        cell_count = len([c for c in cells if c.strip() == '']) - 2  # Subtract 2 for leading/trailing empty
        if cell_count <= 0:
            cell_count = row.count('|') - 1
        return '|' + '|'.join(['---'] * cell_count) + '|'
    
    # Match separator rows that are empty or have only spaces/dashes
    text = re.sub(r'\|[\s]*\|[\s]*\|[\s]*\|', fix_separator_row, text)
    text = re.sub(r'\|\s+\|\s+\|\s+\|', fix_separator_row, text)
    
    # Fix common table formatting issues
    lines = text.split('\n')
    cleaned_lines = []
    in_table = False
    header_col_count = 0
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Detect if we're in a table
        if stripped.startswith('|') and '|' in stripped[1:]:
            in_table = True
            
            # Split by | and clean each cell
            parts = stripped.split('|')
            cleaned_parts = []
            
            for j, part in enumerate(parts):
                cell = part.strip()
                cleaned_parts.append(cell)
            
            # Remove empty first and last elements
            if cleaned_parts and cleaned_parts[0] == '':
                cleaned_parts = cleaned_parts[1:]
            if cleaned_parts and cleaned_parts[-1] == '':
                cleaned_parts = cleaned_parts[:-1]
            
            # Track header column count for consistency
            if not header_col_count and cleaned_parts:
                header_col_count = len(cleaned_parts)
            
            # If this is the separator row (second row), ensure proper format
            if i > 0 and all(c.strip() == '' or set(c.strip()) <= {'-', ':', ' '} for c in cleaned_parts):
                cleaned_parts = ['---'] * header_col_count if header_col_count else ['---'] * len(cleaned_parts)
            
            # Reconstruct the table row
            if cleaned_parts:
                line = '| ' + ' | '.join(cleaned_parts) + ' |'
        else:
            if in_table and not stripped:
                in_table = False
                header_col_count = 0
        
        cleaned_lines.append(line)
    
    text = '\n'.join(cleaned_lines)
    
    # Remove duplicate separator lines in tables
    text = re.sub(r'(\|[-\s:|]+\|\n)+', r'\1', text)
    
    # Ensure bullet points have consistent formatting
    text = re.sub(r'^[•●]\s*', '- ', text, flags=re.MULTILINE)
    
    # Clean up any broken markdown
    text = re.sub(r'\*{3,}', '**', text)  # Fix excessive asterisks
    
    # Fix any remaining word fragment patterns
    # Pattern: "fro from" -> "from", "towar toward" -> "toward"
    text = re.sub(r'\b([a-zA-Z]{2,})\s+(\1[a-zA-Z]+)\b', r'\2', text)
    
    # Fix patterns like "interstiti interstitial" 
    text = re.sub(r'\b([a-zA-Z]{4,}i)\s+(interstitial|intestinal|individual)\b', r'\2', text, flags=re.IGNORECASE)
    
    # General pattern for truncated words followed by full word
    text = re.sub(r'\b([a-zA-Z]{3,})([a-zA-Z])\s+\1\2([a-zA-Z]+)\b', r'\1\2\3', text)
    
    return text.strip()


@app.route('/', methods=['GET'])
def home():
    """Serve the main index.html page"""
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/api/status', methods=['GET'])
def status():
    """API endpoint to check server status"""
    return jsonify({'status': 'Server is running', 'rag_loaded': query_vector_store is not None})

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, images, etc.)"""
    return send_from_directory(BASE_DIR, filename)

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
        
        # Clean and format the response
        answer = clean_and_format_response(answer)
        
        # Update history
        conversation_history.append(("Student", query))
        conversation_history.append(("Assistant", answer))
        
        return jsonify({'answer': answer})
    except Exception as e:
        print(f"Error in query_vector_store: {e}")
        return jsonify({'answer': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Starting RAG Chatbot Server...")
    print("=" * 50)
    print("Make sure Ollama is running with: ollama serve")
    print("")
    print("Open your browser and go to:")
    print("  http://localhost:5000")
    print("")
    print("API endpoints:")
    print("  GET  /api/status - Check server status")
    print("  POST /chat       - Send chat messages")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
