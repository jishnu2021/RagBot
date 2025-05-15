const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Service for interacting with the Gemini API
 */
class GeminiService {
  /**
   * Generate a response based on document content and user query
   * 
   * @param {Object} params - Parameters for generating response
   * @param {string} params.botName - Name of the chatbot
   * @param {string} params.documentContent - Combined content from all documents
   * @param {string} params.userMessage - User's message/question
   * @param {Array} params.conversationHistory - Previous conversation history (optional)
   * @returns {Promise<string>} Generated response
   */
  async generateResponse({ botName, documentContent, userMessage, conversationHistory = [] }) {
    try {
      // Format conversation history if available
      let formattedHistory = '';
      if (conversationHistory.length > 0) {
        formattedHistory = conversationHistory.map(exchange => 
          `User: ${exchange.userMessage}\nAssistant: ${exchange.aiResponse}`
        ).join('\n\n');
      }

      // Prepare the prompt for Gemini
      const prompt = `
        You are a helpful AI assistant named "${botName}" that answers questions based on the following documents:
        
        ${documentContent}
        
        ${formattedHistory ? 'Previous conversation history:\n' + formattedHistory + '\n\n' : ''}
        
        Please use only the information from these documents to answer the user's question.
        If the answer is not in the documents, politely say that you don't have that information.
        Keep your answers clear, concise, and directly relevant to the question.
        Always cite specific parts of the document when appropriate.
        
        User's question: ${userMessage}
      `;
      
      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      return response.text();
    } catch (error) {
      console.error('Error generating response from Gemini:', error);
      throw new Error('Failed to generate response from AI service');
    }
  }
}

module.exports = new GeminiService();