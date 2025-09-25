from session_chain import SessionChain
from document_qa_chain import DocumentQAChain
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import uuid
from dotenv import load_dotenv
import datetime
import os
from werkzeug.utils import secure_filename

load_dotenv()

# TODO: Need to Change Models

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'your_secret_key_here'

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

session_chains = {}
pdf_qa_chains = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'pdf'

@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    """Handle PDF file upload and initialize DocumentQAChain"""
    try:
        # Ensure session exists
        if not session.get('session_id'):
            session_id = str(uuid.uuid4())
            session['session_id'] = session_id
        else:
            session_id = session.get('session_id')

        # Check if file was uploaded
        if 'pdf' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['pdf']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        # Save the file
        filename = secure_filename(file.filename)
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Initialize DocumentQAChain for this session
        pdf_qa_chains[session_id] = DocumentQAChain(session_id, file_path)
        
        return jsonify({
            'message': 'PDF uploaded successfully',
            'filename': filename,
            'session_id': session_id
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Chat endpoint - handles both regular chat and PDF Q&A"""
    try:
        # Ensure session exists
        if not session.get('session_id'):
            session_id = str(uuid.uuid4())
            session['session_id'] = session_id
        else:
            session_id = session.get('session_id')

        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Empty message'}), 400
        
        # Check if this session has a PDF loaded
        if session_id in pdf_qa_chains:
            # Use DocumentQAChain for PDF-related questions
            try:
                response_data = pdf_qa_chains[session_id].ask_question(message)

                if 'error' in response_data:
                    return jsonify({'error': response_data['error']}), 500
                else:
                    response = response_data['answer']

            except Exception as e:
                return jsonify({'error': f'Error processing question: {str(e)}'}), 500
            
        else:
            if session_id not in session_chains:
                session_chains[session_id] = SessionChain(session_id)
            response = session_chains[session_id].chain.predict(input=message)
        
        return jsonify({
            'reply': response,
            'timestamp': str(datetime.datetime.now()),
            'has_pdf': session_id in pdf_qa_chains
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/pdf-status', methods=['GET'])
def pdf_status():
    """Check if current session has a PDF loaded"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'has_pdf': False})
        
        has_pdf = session_id in pdf_qa_chains
        return jsonify({'has_pdf': has_pdf, 'session_id': session_id})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/remove-pdf', methods=['POST'])
def remove_pdf():
    """Remove PDF from current session"""
    try:
        session_id = session.get('session_id')
        if session_id and session_id in pdf_qa_chains:
            del pdf_qa_chains[session_id]
            return jsonify({'message': 'PDF removed successfully'})
        
        return jsonify({'message': 'No PDF to remove'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)