# Google NotebookLM Clone (RAG Pipeline)

A full-stack RAG (Retrieval-Augmented Generation) application inspired by Google NotebookLM. This project allows users to upload any document (PDF or TXT) and have intelligent, context-grounded conversations with it. 

The application implements a complete RAG pipeline locally, running embeddings directly on your CPU without requiring paid embedding APIs, and uses Groq for lightning-fast LLM responses.

![NotebookLM RAG Demo UI Placeholder](https://via.placeholder.com/800x400?text=NotebookLM+RAG+Interface)

## 🚀 Features

- **Document Ingestion**: Seamlessly upload and parse `.pdf` and `.txt` files.
- **Intelligent Chunking**: Employs `RecursiveCharacterTextSplitter` to maintain semantic meaning across text chunks.
- **Local Embeddings**: Generates embeddings locally using `@xenova/transformers` (`all-MiniLM-L6-v2`), completely eliminating the need for paid APIs like OpenAI or HuggingFace Pro.
- **Custom Vector Store**: Implements a highly efficient, zero-setup, in-memory cosine similarity vector database. No Qdrant/Pinecone Docker setups required!
- **Grounded Q&A**: Uses Groq's high-speed LLMs to answer questions strictly based on the uploaded document's context, citing source page numbers to prevent hallucinations.
- **Premium UI**: A sleek, modern frontend featuring glassmorphism, dynamic gradients, and smooth micro-animations.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Multer
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **RAG / AI**: LangChain, `@xenova/transformers` (Local Embeddings), Groq API (LLM Generation)

##  Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/RajPrakash681/megallm.git
   cd megallm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   PORT=3000
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```
   *Navigate to `http://localhost:3000` in your browser.*

## 🌍 Deployment (Render)

This project is optimized for zero-setup deployment on [Render](https://render.com/).

1. Create a new **Web Service** on Render.
2. Connect this GitHub repository.
3. Configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `GROQ_API_KEY`: Your Groq API key
5. Click **Deploy**.

## 📝 Assignment Requirements Fulfilled

- ✅ End-to-end RAG pipeline (Ingestion -> Chunking -> Embedding -> Storage -> Retrieval -> Generation)
- ✅ Document Upload (PDF/TXT)
- ✅ Clearly defined Chunking Strategy
- ✅ Vector Database utilized (Custom zero-setup Cosine Similarity Store)
- ✅ LLM strictly uses retrieved context (No hallucination from memory)
- ✅ Accessible Live Project Link
