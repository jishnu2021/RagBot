# RAG-based Chatbot Creator

This is a backend application that allows users to create custom chatbots based on their documents using Retrieval-Augmented Generation (RAG) technology with Google's Gemini API.

## Features

- Upload documents (PDF, DOC, DOCX, TXT) to create custom chatbots
- Document text is processed, chunked, and stored in vector embeddings
- RAG architecture retrieves relevant document snippets to answer user queries
- Chatbots have their own shareable URLs and QR codes
- Clean and responsive chat interface

## Setup

1. **Clone the repository**

2. **Install dependencies**
   ```
   cd Serverside
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `example.env` file to `.env` and add your Gemini API key:
   ```
   cp example.env .env
   ```
   
   Edit the `.env` file and replace `your_api_key_here` with your actual Gemini API key.

4. **Start the server**
   ```
   node server.js
   ```
   
   The server will start on http://localhost:5000 (or the port specified in your .env file).

## How it Works

1. **Document Processing**: When you upload documents, they are processed and split into small chunks.

2. **Vector Embeddings**: Each chunk is converted into a vector embedding using Gemini's embedding model.

3. **Retrieval**: When a question is asked, the system finds the most relevant document chunks.

4. **Generation**: The relevant chunks are sent to the Gemini model as context, along with the user's question.

5. **Response**: The model generates a response based only on the provided context.

## API Endpoints

- `POST /api/chatbots` - Create a new chatbot with documents
- `GET /api/chatbots` - List all chatbots
- `GET /api/chatbots/:chatbotId` - Get information about a specific chatbot
- `POST /api/chatbots/:chatbotId/ask` - Ask a question to a chatbot

## Technologies Used

- **Node.js** and **Express** for the backend server
- **Google's Gemini API** for embeddings and text generation
- **Multer** for file uploads
- **PDF-parse** and **Mammoth** for document processing

## Limitations

- Currently supports only English language content
- Maximum file size for uploads is 10MB
- Limited to 5 documents per chatbot

## License

This project is licensed under the MIT License. 