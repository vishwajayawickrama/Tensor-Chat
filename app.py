from session_chain import Session_Chain
from flask import Flask, request, jsonify, Response, session
from flask_cors import CORS
import json
import uuid
from dotenv import load_dotenv
from threading import Lock
import datetime
import uuid



app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'your_secret_key_here'

session_chains = {}

@app.route('/chat', methods=['POST'])
def chat():
    """Regular chat endpoint - returns complete response"""
    try:
        if not session.get('session_id'):
            session_id = str(uuid.uuid4())
            session['session_id'] = session_id
            session_chains[session_id] = Session_Chain(session_id)

        session_id = session.get('session_id')
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Empty message'}), 400
        
        response = session_chains[session_id].chain.predict(input=message)
        
        return jsonify({
            'reply': response,
            'timestamp': str(datetime.now())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    from datetime import datetime
    app.run(debug=True, host='0.0.0.0', port=5001)