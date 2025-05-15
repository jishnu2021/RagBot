const { v4: uuidv4 } = require('uuid');
const { ChatbotModel } = require('../models/chatbotModel');
const { processDocument } = require('../utils/documentProcessor');
const geminiService = require('../services/geminiService');
const RagService = require('../services/ragService');
const fs = require('fs');
const QRCode = require('qrcode');
const path = require('path');

// Helper function to generate base URL
const getBaseUrl = (req) => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || 'https://rag-chatbot-backend.onrender.com';
  }
  return `${req.protocol}://${req.get('host')}`;
};

/**
 * Controller for chatbot operations
 */
const chatbotController = {
  /**
   * Create a new chatbot
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createChatbot: async (req, res) => {
    // Set a large timeout for the request
    req.setTimeout(300000); // 5 minutes
    
    try {
      const { botName, botDescription } = req.body;
      const files = req.files;
      
      if (!botName || !files || files.length === 0) {
        return res.status(400).json({ 
          error: 'Missing required fields: botName and at least one document'
        });
      }
      
      console.log(`Creating chatbot "${botName}" with ${files.length} documents`);
      
      // Log file information
      const fileInfo = files.map(file => ({
        name: file.originalname,
        size: `${Math.round(file.size/1024)} KB`,
        type: file.mimetype
      }));
      console.log('Uploaded files:', JSON.stringify(fileInfo, null, 2));
      
      // Initialize RAG service
      const ragService = initRagService();
      
      // Generate unique ID
      const chatbotId = Date.now().toString();
      
      // Create chatbot
      const chatbot = await ragService.createChatbot(
        chatbotId,
        botName,
        botDescription || '',
        files
      );
      
      // Generate QR code and chatbot URL
      const baseUrl = getBaseUrl(req);
      const chatbotLink = `${baseUrl}/chatbot/${chatbotId}`;
      const qrCodeLink = await QRCode.toDataURL(chatbotLink);
      
      console.log(`Chatbot "${botName}" (ID: ${chatbotId}) created successfully`);
      
      // Return response
      res.status(201).json({
        ...chatbot,
        chatbotLink,
        qrCodeLink
      });
    } catch (error) {
      console.error(`Error creating chatbot: ${error.message}`);
      res.status(500).json({ error: `Error creating chatbot: ${error.message}` });
    }
  },
  
  /**
   * Get chatbot information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getChatbot: async (req, res) => {
    try {
      const { chatbotId } = req.params;
      
      // Read chatbots.json
      const chatbotsPath = path.join(__dirname, '../chatbots.json');
      if (!fs.existsSync(chatbotsPath)) {
        return res.status(404).json({ error: 'No chatbots found' });
      }
      
      const chatbotsFile = fs.readFileSync(chatbotsPath, 'utf8');
      const chatbots = JSON.parse(chatbotsFile);
      
      if (!chatbots[chatbotId]) {
        return res.status(404).json({ error: 'Chatbot not found' });
      }
      
      // Generate chatbot link
      const baseUrl = getBaseUrl(req);
      const chatbotLink = `${baseUrl}/chatbot/${chatbotId}`;
      
      res.json({
        chatbotId,
        ...chatbots[chatbotId],
        chatbotLink
      });
    } catch (error) {
      console.error(`Error getting chatbot: ${error.message}`);
      res.status(500).json({ error: `Error getting chatbot: ${error.message}` });
    }
  },
  
  /**
   * Process a chat message and get response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  processChatMessage: async (req, res) => {
    try {
      const { chatbotId } = req.params;
      const { message, conversationHistory = [] } = req.body;
      
      // Find the chatbot data
      const chatbot = await ChatbotModel.findOne({ chatbotId });
      if (!chatbot) {
        return res.status(404).json({ success: false, message: 'Chatbot not found' });
      }
      
      // Get the combined content from all documents
      const documentContent = chatbot.processedContent.map(doc => doc.content).join('\n\n');
      
      // Generate response using the Gemini service
      const responseText = await geminiService.generateResponse({
        botName: chatbot.name,
        documentContent,
        userMessage: message,
        conversationHistory: conversationHistory
      });
      
      // Store the conversation in the database
      chatbot.conversations.push({
        userMessage: message,
        aiResponse: responseText,
        timestamp: new Date()
      });
      await chatbot.save();
      
      res.json({
        success: true,
        response: responseText
      });
    } catch (error) {
      console.error('Error in chatbot conversation:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },
  
  /**
   * Answer a question using the chatbot
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  answerQuestion: async (req, res) => {
    try {
      const { chatbotId } = req.params;
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }
      
      // Initialize RAG service
      const ragService = initRagService();
      
      // Get answer
      const answer = await ragService.answerQuestion(chatbotId, question);
      
      res.json(answer);
    } catch (error) {
      console.error(`Error answering question: ${error.message}`);
      res.status(500).json({ error: `Error answering question: ${error.message}` });
    }
  },
  
  /**
   * Get all chatbots
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllChatbots: async (req, res) => {
    try {
      // Read chatbots.json
      const chatbotsPath = path.join(__dirname, '../chatbots.json');
      if (!fs.existsSync(chatbotsPath)) {
        return res.json({ chatbots: {} });
      }
      
      const chatbotsFile = fs.readFileSync(chatbotsPath, 'utf8');
      const chatbots = JSON.parse(chatbotsFile);
      
      // Format response with proper base URL
      const baseUrl = getBaseUrl(req);
      const formattedChatbots = {};
      
      for (const [id, chatbot] of Object.entries(chatbots)) {
        const chatbotLink = `${baseUrl}/chatbot/${id}`;
        
        formattedChatbots[id] = {
          ...chatbot,
          chatbotLink
        };
      }
      
      res.json({ chatbots: formattedChatbots });
    } catch (error) {
      console.error(`Error getting all chatbots: ${error.message}`);
      res.status(500).json({ error: `Error getting all chatbots: ${error.message}` });
    }
  }
};

// Initialize RAG service
let ragService = null;

// Ensure API key is loaded
const initRagService = () => {
  if (ragService) return ragService;
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  ragService = new RagService(process.env.GEMINI_API_KEY);
  return ragService;
};

module.exports = chatbotController;