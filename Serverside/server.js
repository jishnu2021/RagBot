/**
 * RAG-based Chatbot Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Check for required API key
if (!process.env.GEMINI_API_KEY) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: GEMINI_API_KEY environment variable is not set!');
  console.log('Please create a .env file in the root directory with your Gemini API key:');
  console.log('GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// For simplicity, allow all origins during debugging
app.use(cors());
console.log('CORS enabled for all origins temporarily for debugging');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Create required directories
const dirs = ['uploads', 'public'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Initialize empty chatbots.json if it doesn't exist
const chatbotsPath = path.join(__dirname, 'chatbots.json');
if (!fs.existsSync(chatbotsPath)) {
  fs.writeFileSync(chatbotsPath, '{}', 'utf8');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    requestOrigin: req.headers.origin || 'unknown'
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS is working properly!',
    origin: req.headers.origin || 'unknown',
    time: new Date().toISOString()
  });
});

// Routes
const chatbotRoutes = require('./routes/chatbotRoutes');

// Mount API routes under /api
app.use('/api', chatbotRoutes);

// Also mount the chatbot UI route directly
const chatbotUIRouter = express.Router();
chatbotUIRouter.get('/:chatbotId', (req, res) => {
  const { chatbotId } = req.params;
  
  // Check if chatbot exists
  const chatbotsPath = path.join(__dirname, 'chatbots.json');
  if (!fs.existsSync(chatbotsPath)) {
    return res.status(404).send('No chatbots found');
  }
  
  const chatbotsFile = fs.readFileSync(chatbotsPath, 'utf8');
  const chatbots = JSON.parse(chatbotsFile);
  
  if (!chatbots[chatbotId]) {
    return res.status(404).send('Chatbot not found');
  }
  
  const botName = chatbots[chatbotId].botName || 'Chatbot';
  const botDescription = chatbots[chatbotId].botDescription || '';
  
  // HTML content for the chatbot UI
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${botName}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
      <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #4f46e5;
          --primary-hover: #4338ca;
          --primary-light: #e0e7ff;
          --primary-dark: #3730a3;
          --surface: #ffffff;
          --surface-hover: #f9fafb;
          --surface-border: #e5e7eb;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --text-tertiary: #9ca3af;
          --destructive: #ef4444;
          --success: #10b981;
          --warning: #f59e0b;
          --info: #3b82f6;
          --radius: 0.5rem;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
          line-height: 1.6;
          color: var(--text-primary);
          background-color: #f3f4f6;
          max-width: 100%;
          overflow-x: hidden;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          margin-bottom: 0.5rem;
          position: relative;
          display: inline-block;
        }
        
        h1:after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: -8px;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: var(--primary);
          border-radius: 2px;
        }
        
        .description {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 1.5rem auto 0;
        }
        
        .chat-container {
          background: var(--surface);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          transition: all 0.3s ease;
          transform: translateY(0);
          border: 1px solid var(--surface-border);
        }
        
        .chat-container:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }
        
        .chat-header {
          background: var(--primary);
          color: white;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--primary-dark);
        }
        
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          font-weight: 600;
          color: var(--primary);
          font-size: 1rem;
        }
        
        .bot-info h2 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
        }
        
        .bot-info p {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-top: 0.25rem;
        }
        
        .messages-container {
          height: 400px;
          overflow-y: auto;
          padding: 1.5rem;
          background-color: #f9fafc;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%234f46e5' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
        
        .conversation {
          margin-top: 1rem;
        }
        
        .message {
          margin-bottom: 1rem;
          max-width: 80%;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .message-content {
          padding: 1rem;
          border-radius: 1rem;
          box-shadow: var(--shadow-sm);
          position: relative;
        }
        
        .message-content p {
          margin: 0;
          white-space: pre-wrap;
        }
        
        .user-message {
          margin-left: auto;
        }
        
        .user-message .message-content {
          background-color: var(--primary);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }
        
        .bot-message {
          margin-right: auto;
        }
        
        .bot-message .message-content {
          background-color: white;
          border: 1px solid var(--surface-border);
          border-bottom-left-radius: 0.25rem;
        }
        
        .user-message .message-content:before,
        .bot-message .message-content:before {
          content: '';
          position: absolute;
          bottom: 0;
          width: 12px;
          height: 12px;
        }
        
        .user-message .message-content:before {
          right: -6px;
          border-bottom-left-radius: 12px;
          border-width: 6px;
          border-style: solid;
          border-color: transparent transparent var(--primary) var(--primary);
          transform: rotate(45deg);
        }
        
        .bot-message .message-content:before {
          left: -6px;
          border-bottom-right-radius: 12px;
          border-width: 6px;
          border-style: solid;
          border-color: transparent var(--surface-border) var(--surface-border) transparent;
          background-color: white;
          transform: rotate(45deg);
        }
        
        .input-container {
          padding: 1.25rem;
          background-color: white;
          border-top: 1px solid var(--surface-border);
          display: flex;
          position: relative;
        }
        
        #question {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          font-size: 1rem;
          font-family: inherit;
          box-shadow: var(--shadow-sm);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        #question:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }
        
        button {
          background-color: var(--primary);
          color: white;
          border: none;
          padding: 0 1.25rem;
          margin-left: 0.75rem;
          border-radius: var(--radius);
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        button:hover {
          background-color: var(--primary-hover);
        }
        
        button:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--primary-light);
        }
        
        button svg {
          width: 20px;
          height: 20px;
        }
        
        .loading {
          display: flex;
          align-items: center;
          color: var(--text-secondary);
        }
        
        .typing-indicator {
          display: inline-flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: var(--text-tertiary);
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.5s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
        
        #answer {
          white-space: pre-wrap;
        }
        
        footer {
          text-align: center;
          padding: 1.5rem 0;
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }
        
        footer a {
          color: var(--primary);
          text-decoration: none;
        }
        
        footer a:hover {
          text-decoration: underline;
        }
        
        .welcome-message {
          background-color: var(--primary-light);
          padding: 1rem;
          border-radius: var(--radius);
          border-left: 4px solid var(--primary);
          margin-bottom: 1.5rem;
          animation: slideIn 0.5s ease;
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .welcome-message h3 {
          color: var(--primary-dark);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        /* Responsive styles */
        @media (max-width: 640px) {
          .container {
            padding: 1rem;
          }
          
          h1 {
            font-size: 1.5rem;
          }
          
          .description {
            font-size: 1rem;
          }
          
          .messages-container {
            height: 350px;
          }
          
          .message {
            max-width: 90%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>${botName}</h1>
          <p class="description">${botDescription}</p>
        </header>
        
        <div class="chat-container">
          <div class="chat-header">
            <div class="avatar">AI</div>
            <div class="bot-info">
              <h2>${botName}</h2>
              <p>Powered by RAG technology</p>
            </div>
          </div>
          
          <div class="messages-container" id="messages-container">
            <div class="welcome-message">
              <h3>Welcome to ${botName}!</h3>
              <p>Ask me anything about the documents I've been trained on. I'll do my best to provide accurate, contextual answers.</p>
            </div>
            
            <div class="conversation" id="conversation"></div>
          </div>
          
          <div class="input-container">
            <input 
              id="question" 
              type="text" 
              placeholder="Ask a question..." 
              autocomplete="off"
            />
            <button onclick="ask()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
        
        <footer>
          Powered by <a href="https://ai.google.dev/" target="_blank">Gemini AI</a> with RAG technology
        </footer>
      </div>
      
      <script>
        // Store conversation history
        const conversation = [];
        const messagesContainer = document.getElementById('messages-container');
        const conversationElement = document.getElementById('conversation');
        const questionInput = document.getElementById('question');
        
        // Focus on the input field when the page loads
        questionInput.focus();
        
        async function ask() {
          const q = questionInput.value.trim();
          
          if (!q) return;
          
          // Add user question to conversation and UI
          addMessage('user', q);
          
          // Clear input
          questionInput.value = '';
          
          // Show typing indicator
          const typingIndicator = document.createElement('div');
          typingIndicator.className = 'message bot-message';
          typingIndicator.innerHTML = \`
            <div class="message-content loading">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          \`;
          conversationElement.appendChild(typingIndicator);
          scrollToBottom();
          
          try {
            const response = await fetch('/api/chatbots/${chatbotId}/ask', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ question: q })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            conversationElement.removeChild(typingIndicator);
            
            if (response.ok) {
              // Add bot answer to conversation and UI
              addMessage('bot', data.answer);
            } else {
              addMessage('bot', "I'm sorry, I couldn't process your question. " + (data.error || "Please try again."));
            }
          } catch (error) {
            // Remove typing indicator
            conversationElement.removeChild(typingIndicator);
            
            // Show error message
            addMessage('bot', "I'm sorry, there was an error connecting to the server. Please try again later.");
          }
        }
        
        function addMessage(sender, text) {
          // Add to conversation array
          conversation.push({ sender, text });
          
          // Create message element
          const messageElement = document.createElement('div');
          messageElement.className = \`message \${sender}-message\`;
          
          messageElement.innerHTML = \`
            <div class="message-content">
              <p>\${text}</p>
            </div>
          \`;
          
          // Add to UI
          conversationElement.appendChild(messageElement);
          
          // Scroll to bottom
          scrollToBottom();
        }
        
        function scrollToBottom() {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Allow pressing Enter to submit
        questionInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            ask();
          }
        });
        
        // Add some subtle animations on page load
        document.addEventListener('DOMContentLoaded', function() {
          document.querySelector('.chat-container').style.opacity = 0;
          setTimeout(() => {
            document.querySelector('.chat-container').style.opacity = 1;
            document.querySelector('.chat-container').style.transition = 'opacity 0.5s ease';
          }, 100);
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

app.use('/chatbot', chatbotUIRouter);

// Default route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RAG-based Chatbot Creator</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
      <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        }
        .form-container {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-top: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        input, textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        textarea {
          height: 100px;
          resize: vertical;
        }
        button {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          display: inline-block;
        }
        button:hover {
          background: #2980b9;
        }
        .loading {
          display: none;
          margin-top: 20px;
        }
        .error {
          color: #e74c3c;
          margin-top: 10px;
        }
        .success {
          background: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
          display: none;
        }
        .chatbots-list {
          margin-top: 30px;
        }
        .chatbot-item {
          background: white;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chatbot-name {
          font-weight: bold;
        }
        .chatbot-link {
          text-decoration: none;
          background: #3498db;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <h1>RAG-based Chatbot Creator</h1>
      <p>Create a custom chatbot based on your documents using Retrieval-Augmented Generation (RAG) technology.</p>
      
      <div class="form-container">
        <form id="chatbot-form" enctype="multipart/form-data">
          <label for="botName">Chatbot Name:</label>
          <input type="text" id="botName" name="botName" required>
          
          <label for="botDescription">Chatbot Description:</label>
          <textarea id="botDescription" name="botDescription"></textarea>
          
          <label for="documents">Upload Documents (PDF, DOC, DOCX, TXT):</label>
          <input type="file" id="documents" name="documents" multiple accept=".pdf,.doc,.docx,.txt" required>
          
          <button type="submit">Create Chatbot</button>
          
          <div class="loading" id="loading">Creating your chatbot...</div>
          <div class="error" id="error"></div>
          <div class="success" id="success"></div>
        </form>
      </div>
      
      <div class="chatbots-list" id="chatbots-list">
        <h2>Your Chatbots</h2>
        <div id="chatbot-items">Loading...</div>
      </div>
      
      <script>
        // Helper function to display error
        function showError(message) {
          const errorEl = document.getElementById('error');
          errorEl.textContent = message;
          errorEl.style.display = 'block';
          document.getElementById('loading').style.display = 'none';
        }
        
        // Helper function to display success
        function showSuccess(chatbot) {
          const successEl = document.getElementById('success');
          successEl.innerHTML = \`
            Your chatbot "<strong>\${chatbot.botName}</strong>" has been created!<br>
            <a href="\${chatbot.chatbotLink}" target="_blank">Open Chatbot</a>
          \`;
          successEl.style.display = 'block';
          document.getElementById('loading').style.display = 'none';
          
          // Clear form
          document.getElementById('chatbot-form').reset();
          
          // Refresh chatbot list
          loadChatbots();
        }
        
        // Create a new chatbot
        document.getElementById('chatbot-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const errorEl = document.getElementById('error');
          const loadingEl = document.getElementById('loading');
          const successEl = document.getElementById('success');
          
          // Reset UI
          errorEl.style.display = 'none';
          successEl.style.display = 'none';
          loadingEl.style.display = 'block';
          
          try {
            const response = await fetch('/api/chatbots', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              showError(result.error || 'Failed to create chatbot');
              return;
            }
            
            showSuccess(result);
          } catch (error) {
            showError('Network error: ' + error.message);
          }
        });
        
        // Load existing chatbots
        async function loadChatbots() {
          const chatbotsContainer = document.getElementById('chatbot-items');
          
          try {
            const response = await fetch('/api/chatbots');
            
            if (!response.ok) {
              chatbotsContainer.innerHTML = '<p>Error loading chatbots</p>';
              return;
            }
            
            const result = await response.json();
            const chatbots = result.chatbots;
            
            if (Object.keys(chatbots).length === 0) {
              chatbotsContainer.innerHTML = '<p>No chatbots created yet</p>';
              return;
            }
            
            // Build chatbot list HTML
            let html = '';
            for (const [id, chatbot] of Object.entries(chatbots)) {
              html += \`
                <div class="chatbot-item">
                  <div>
                    <div class="chatbot-name">\${chatbot.botName}</div>
                    <div class="chatbot-description">\${chatbot.botDescription || ''}</div>
                  </div>
                  <a href="\${chatbot.chatbotLink}" target="_blank" class="chatbot-link">Open Chatbot</a>
                </div>
              \`;
            }
            
            chatbotsContainer.innerHTML = html;
          } catch (error) {
            chatbotsContainer.innerHTML = '<p>Error loading chatbots: ' + error.message + '</p>';
          }
        }
        
        // Load chatbots on page load
        loadChatbots();
      </script>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   RAG-based Chatbot Server is running on port ${PORT}        ║
  ║                                                            ║
  ║   • Web interface: http://localhost:${PORT}                  ║
  ║   • Health endpoint: http://localhost:${PORT}/health         ║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});