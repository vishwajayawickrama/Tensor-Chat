from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.document_loaders import PyPDFLoader
from langchain.vectorstores import DocArrayInMemorySearch
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os

load_dotenv()

class DocumentQAChain:
    def __init__(self, session_id, document_path):
        self.session_id = session_id
        self.document_path = document_path
        self.chain = self.create_chain()

    def create_chain(self):
        llm = ChatGroq(
            groq_api_key=os.getenv("GROQ_API_KEY"),
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1000,
            streaming=False
        )

        prompt_template = """
                                Use the following context from the PDF to answer the question. 
                                If you don't know the answer based on the context, say so clearly.

                                Context: {context}

                                Question: {question}

                                Answer:"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        loader = PyPDFLoader(file_path=self.document_path)
        
        index = VectorstoreIndexCreator(
            embedding=embeddings,
            vectorstore_cls=DocArrayInMemorySearch
        ).from_loaders([loader])
        
        # Create RetrievalQA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=index.vectorstore.as_retriever(),
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )
        
        return qa_chain

    def ask_question(self, question):
        try:
            response = self.chain({"query": question})
            return {
                "answer": response["result"],
                "source_documents": response.get("source_documents", [])
            }
        except Exception as e:
            return {
                "error": f"Error processing question: {str(e)}",
                "answer": None,
                "source_documents": []
            }