# RAG-Based Chatbot with Gemini API

This is a RAG (Retrieval-Augmented Generation) based chatbot that uses the Gemini API to answer questions based on uploaded documents.

## Project Structure

- `Serverside`: Node.js backend for processing documents and handling chatbot interactions
- `chatbot-genesis-react`: React frontend for user interface

## Local Setup Instructions

### Backend Setup

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Navigate to the `Serverside` directory
3. Create a `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Start the server:
   ```
   node server.js
   ```
   
The server should now be running at http://localhost:5000

### Frontend Setup

1. Navigate to the `chatbot-genesis-react` directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

The frontend should now be running at http://localhost:3000

## Deployment to Render.com

This application is set up for easy deployment on Render.com using the `render.yaml` configuration file.

### Option 1: Deploy with Blueprint (Recommended)

1. Fork this repository to your GitHub account
2. Log in to [Render.com](https://render.com)
3. Click "New" > "Blueprint"
4. Connect your GitHub account and select the forked repository
5. Click "Apply Blueprint"
6. When prompted, add your `GEMINI_API_KEY` environment variable
7. Wait for the deployment to complete

### Option 2: Manual Deployment

#### Backend Deployment

1. Log in to [Render.com](https://render.com)
2. Click "New" > "Web Service"
3. Connect your GitHub repository
4. Use the following settings:
   - **Name**: rag-chatbot-backend
   - **Environment**: Node
   - **Build Command**: `cd Serverside && npm install`
   - **Start Command**: `cd Serverside && node server.js`
   - **Plan**: Free
5. Add the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `GEMINI_API_KEY`: your_gemini_api_key_here
   - `FRONTEND_URL`: URL of your frontend (e.g., https://your-frontend-name.onrender.com)
   - `BACKEND_URL`: URL of your backend (e.g., https://your-backend-name.onrender.com)
6. Click "Create Web Service"

#### Frontend Deployment

1. Log in to [Render.com](https://render.com)
2. Click "New" > "Static Site"
3. Connect your GitHub repository
4. Use the following settings:
   - **Name**: rag-chatbot-frontend
   - **Build Command**: `cd chatbot-genesis-react && npm install && npm run build`
   - **Publish Directory**: `chatbot-genesis-react/dist`
   - **Plan**: Free
5. Add the following environment variables:
   - `VITE_API_URL`: URL of your backend (e.g., https://your-backend-name.onrender.com)
6. Add a redirect rule:
   - **Source Path**: /*
   - **Destination Path**: /index.html
   - **Status Code**: 200
7. Click "Create Static Site"

## How It Works

1. **Document Upload**: Upload PDF, DOC, DOCX, or TXT files containing information
2. **Document Processing**: Files are processed, chunked, and vectorized
3. **RAG Architecture**: Uses Retrieval-Augmented Generation to find relevant information from documents
4. **AI Response**: Generates contextual, accurate answers using the Gemini API
5. **QR Code Sharing**: Each chatbot gets a unique URL and QR code for easy sharing

## Features

- Multiple document upload support
- Beautiful, responsive UI
- Real-time chat interface
- Shareable links and QR codes for each chatbot
- Document context for accurate answers

## Limitations

- Free tier of Render may have performance constraints
- File uploads are limited to 50MB per file
- Persistent storage depends on Render's ephemeral filesystem

## Troubleshooting

### Connection Refused Error

If you see "ERR_CONNECTION_REFUSED" in the console:

1. Make sure the backend server is running on port 5000
2. Check that your Gemini API key is valid in the `.env` file
3. Ensure there are no other services using port 5000

### File Upload Issues

If file uploads time out or fail:

1. Check the file size (current limit is 50MB per file)
2. Try with smaller or fewer files
3. Check the server logs for specific error messages

### Empty or Invalid Responses

If you get empty or unhelpful responses:

1. Ensure your documents were properly processed
2. Check that the Gemini API key has sufficient quota
3. Try asking more specific questions related to your documents 