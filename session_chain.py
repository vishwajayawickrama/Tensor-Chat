from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, AIMessage
from langchain.callbacks.base import BaseCallbackHandler
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import ConversationChain
from dotenv import load_dotenv
import os

load_dotenv()

class Session_Chain:
    def __init__(self, session_id):
        self.session_id = session_id
        self.chain = self.create_chain()

    def create_chain(self):
        llm = ChatGroq(
            groq_api_key=os.getenv("GROQ_API_KEY"),
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1000,
            streaming=False
        )
    
        memory = ConversationBufferWindowMemory(
            k=10, 
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
            verbose=True
        )
        
        return chain