# Tensor Chat (v3)

**Tensor Chat v3** is a fast, modern AI chatbot powered by **LLaMA 3.3 70B via Groq**, with **LangChain memory**, **Document Q&A capabilities**, multi-user session support, a Flask backend, and a beautiful React + Tailwind frontend.

---

## Features – v3

- Real-time conversational AI
- Powered by LLaMA 3.3-70B via Groq API
- Maintains memory of last 10 messages (LangChain buffer)
- **Document Q&A System** - Upload PDFs and ask questions about them
- **Semantic Search** - HuggingFace embeddings with vector similarity search
- **In-Memory Vector Store** - Fast document retrieval using DocArray
- Modern responsive chat UI with drag-and-drop PDF upload
- Multi-user session support with PDF-specific sessions
- Avatar icons, typing indicators, and visual PDF status
- **Hybrid Chat Mode** - Seamlessly switches between general chat and document Q&A

> **Version 1 (v1)** – a Minimum Viable Product (MVP) for the core chat system.

> **Version 2 (v2)** – Added multi-user session support, avatar icons and typing indicators.

> **Version 3 (v3)** (Active)
> - Document Q&A with PDF upload functionality
> - Semantic search using HuggingFace embeddings (sentence-transformers/all-MiniLM-L6-v2)
> - In-memory vector stores with DocArrayInMemorySearch
> - Context-aware answers from uploaded documents
> - Intelligent routing between general chat and document Q&A
> - Enhanced UI with drag-and-drop PDF upload and visual indicators

> **Future Roadmap**
> - Streaming responses
> - Persistent chat history
> - Multiple document support
> - Advanced document types (Word, Excel, etc.)

---

## Tech Stack

| Layer              | Technology                           |
|-------------------|--------------------------------------|
| Frontend          | React, Tailwind CSS, Vite           |
| Backend           | Flask, LangChain                     |
| LLM               | LLaMA 3.3-70B via Groq API          |
| Document AI       | LangChain Document Loaders           |
| Embeddings        | HuggingFace Transformers             |
| Vector Store      | DocArrayInMemorySearch               |
| PDF Processing    | PyPDFLoader, pdfminer.six            |

## Document Q&A Features

### Semantic Search
- **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Vector Similarity**: Cosine similarity for document chunks
- **Context Retrieval**: Relevant document sections for each query

### Document Processing
- **Supported Format**: PDF files (up to 16MB)
- **Text Extraction**: PyPDFLoader with robust parsing
- **Chunking Strategy**: Automatic text splitting for optimal retrieval

### Vector Storage
- **In-Memory Store**: DocArrayInMemorySearch for fast retrieval
- **Session-Based**: Separate vector stores per user session
- **Real-Time**: Instant document processing and indexing

### Smart Routing
- **Context Detection**: Automatically uses document Q&A when PDF is loaded
- **Graceful Fallback**: Falls back to general chat if document Q&A fails
- **Session Persistence**: Remembers document state across page refreshes

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Groq API Key ([Get one here](https://console.groq.com/))

### 1. Clone & Setup Backend
```bash
git clone https://github.com/vishwajayawickrama/Tensor-Chat.git
cd Tensor-Chat

# One command setup (creates venv + installs requirements)
make setup

# Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 2. Setup Frontend
```bash
cd UI
npm install
```

### 3. Run the Application
```bash
# Terminal 1: Start Flask backend
make run

# Terminal 2: Start React frontend
cd UI && npm run dev
```

Visit `http://localhost:5173`

---

## Usage Guide

### General Chat
- Simply type your message and press Enter
- The AI maintains context of your last 10 messages
- Perfect for general questions, coding help, explanations, etc.

### Document Q&A Mode
1. **Upload PDF**: 
   - Drag & drop a PDF onto the upload zone, or
   - Click "Choose PDF File" button, or
   - Use the paperclip button in chat

2. **Ask Questions**:
   - Once uploaded, ask specific questions about your document
   - Examples: "What is the main topic?", "Summarize the key points", "What does section 3 say about...?"

3. **Smart Context**:
   - The AI will answer based on your document content
   - If it can't find relevant information, it will tell you clearly
   - Falls back to general knowledge if needed

### Hybrid Experience
- **With PDF loaded**: Document-specific questions get answered from your PDF
- **General questions**: Still works normally even with PDF loaded
- **Session management**: Each browser session maintains its own PDF and chat history

---

## Project Structure

```
Tensor-Chat/
├── UI/                             # React Frontend
│   ├── src/App.jsx                 # Main chat interface with PDF upload
│   ├── package.json                # Frontend dependencies
│   └── ...
├── uploads/                        # PDF storage (auto-created)
├── app.py                          # Flask backend with API endpoints
├── session_chain.py               # General chat conversation chains
├── document_qa_chain.py           # Document Q&A processing
├── requirements.txt               # Python dependencies (300+ packages)
├── Makefile                       # Development commands
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Main chat endpoint (hybrid: general + document Q&A) |
| `/upload-pdf` | POST | Upload and process PDF documents |
| `/pdf-status` | GET | Check if session has PDF loaded |
| `/remove-pdf` | POST | Remove PDF from current session |

---

## Development Commands

```bash
# Setup development environment
make setup

# Run Flask development server
make run

# Clean up (remove venv, cache, etc.)
make clean

# Install new Python dependencies
source venv/bin/activate && pip install package_name

# Frontend development
cd UI && npm run dev        # Development server
cd UI && npm run build      # Production build
```

---
