/**
 * Chatbot API routes
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const chatbotController = require('../controllers/chatbotController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedFilename);
  }
});

// Set up file filter
const fileFilter = (req, file, cb) => {
  // Accept only document files
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/json',
    'text/markdown'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, CSV, JSON, and MD files are allowed'), false);
  }
};

// Increase file size limits
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit per file
    files: 10 // maximum 10 files
  }
});

// Create a new chatbot
router.post('/chatbots', upload.array('documents', 10), chatbotController.createChatbot);

// Get all chatbots
router.get('/chatbots', chatbotController.getAllChatbots);

// Get a specific chatbot
router.get('/chatbots/:chatbotId', chatbotController.getChatbot);

// Answer a question using a chatbot
router.post('/chatbots/:chatbotId/ask', chatbotController.answerQuestion);

// Serve chatbot UI
router.get('/chatbot/:chatbotId', (req, res) => {
  const { chatbotId } = req.params;
  
  // Check if chatbot exists
  const chatbotsPath = path.join(__dirname, '../chatbots.json');
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
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${botName}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        .description {
          color: #7f8c8d;
          font-style: italic;
          margin-bottom: 20px;
        }
        .chat-container {
          border-radius: 8px;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
          margin-top: 20px;
        }
        .input-container {
          display: flex;
          margin-bottom: 20px;
        }
        #question {
          flex: 1;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px 0 0 4px;
          font-size: 16px;
        }
        button {
          padding: 12px 20px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 0 4px 4px 0;
          cursor: pointer;
          font-size: 16px;
          transition: background 0.3s;
        }
        button:hover {
          background: #2980b9;
        }
        .answer-container {
          margin-top: 20px;
        }
        #answer {
          background: #f1f9ff;
          border-left: 4px solid #3498db;
          padding: 15px;
          border-radius: 0 4px 4px 0;
          min-height: 60px;
          white-space: pre-wrap;
        }
        .loading {
          color: #7f8c8d;
          display: flex;
          align-items: center;
        }
        .loading:after {
          content: '...';
          animation: dots 1.5s steps(5, end) infinite;
          width: 20px;
          display: inline-block;
          text-align: left;
        }
        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        .conversation {
          margin-top: 30px;
        }
        .message {
          margin-bottom: 20px;
          padding: 10px 15px;
          border-radius: 8px;
          max-width: 80%;
        }
        .user-message {
          background: #e1f5fe;
          margin-left: auto;
          border-bottom-right-radius: 0;
        }
        .bot-message {
          background: #f5f5f5;
          margin-right: auto;
          border-bottom-left-radius: 0;
        }
        footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <h1>${botName}</h1>
      <p class="description">${botDescription}</p>
      
      <div class="chat-container">
        <div class="input-container">
          <input id="question" placeholder="Ask me anything..." autocomplete="off" />
          <button onclick="ask()">Ask</button>
        </div>
        
        <div class="answer-container" id="answer-container">
          <div id="answer">Ask me a question about your documents!</div>
        </div>
        
        <div class="conversation" id="conversation"></div>
      </div>
      
      <footer>
        Powered by Gemini AI with RAG technology
      </footer>
      
      <script>
        // Store conversation history
        const conversation = [];
        
        async function ask() {
          const questionEl = document.getElementById('question');
          const answerEl = document.getElementById('answer');
          const conversationEl = document.getElementById('conversation');
          const q = questionEl.value.trim();
          
          if (!q) return;
          
          // Add user question to conversation
          conversation.push({ role: 'user', text: q });
          updateConversation();
          
          // Clear input
          questionEl.value = '';
          
          // Show loading state
          answerEl.innerText = "Thinking";
          answerEl.classList.add('loading');
          
          try {
            const res = await fetch('/api/chatbots/${chatbotId}/ask', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ question: q })
            });
            
            const data = await res.json();
            answerEl.classList.remove('loading');
            
            if (data.error) {
              answerEl.innerText = "Error: " + data.error;
            } else {
              answerEl.innerText = data.answer;
              
              // Add bot answer to conversation
              conversation.push({ role: 'bot', text: data.answer });
              updateConversation();
            }
          } catch (err) {
            answerEl.classList.remove('loading');
            answerEl.innerText = "Network error. Please try again.";
            console.error(err);
          }
        }
        
        function updateConversation() {
          const conversationEl = document.getElementById('conversation');
          
          // Only show conversation history after the first exchange
          if (conversation.length < 2) {
            conversationEl.innerHTML = '';
            return;
          }
          
          // Clear the answer box after the first exchange
          if (conversation.length >= 2) {
            document.getElementById('answer').innerText = '';
          }
          
          // Build conversation HTML
          conversationEl.innerHTML = conversation.map((msg, index) => {
            const messageClass = msg.role === 'user' ? 'user-message' : 'bot-message';
            return \`<div class="message \${messageClass}">\${msg.text}</div>\`;
          }).join('');
          
          // Scroll to bottom of conversation
          conversationEl.scrollTop = conversationEl.scrollHeight;
        }
        
        // Allow pressing Enter to submit
        document.getElementById('question').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            ask();
          }
        });
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

module.exports = router;