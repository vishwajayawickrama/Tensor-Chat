from flask import Flask, request, jsonify, Response, session
from flask_cors import CORS
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, AIMessage
from langchain.callbacks.base import BaseCallbackHandler
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import ConversationChain
import os
import json
import uuid
from dotenv import load_dotenv
from threading import Lock
import datetime

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("GROQ_API_KEY")
CORS(app)


def create_chain_for_session():
    llm = ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model_name="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=1000,
        streaming=False
    )
    
    # Setup memory with window to keep recent conversation
    memory = ConversationBufferWindowMemory(
        k=10,  # Keep last 10 exchanges
        memory_key="chat_history",
        return_messages=True
    )
    
    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful AI assistant. Provide clear, concise, and engaging responses. 
        Be conversational but informative. If you're unsure about something, acknowledge it."""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])
    
    # Create conversation chain
    chain = ConversationChain(
        llm=llm,
        memory=memory,
        prompt=prompt,
        verbose=False
    )
    
    return chain

chain = create_chain_for_session()

@app.route('/chat', methods=['POST'])
def chat():
    """Regular chat endpoint - returns complete response"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'Empty message'}), 400
        
        # Get response from LangChain
        response = chain.predict(input=message)
        
        return jsonify({
            'response': response,
            'timestamp': str(datetime.now())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    from datetime import datetime
    app.run(debug=True, host='0.0.0.0', port=5001)