const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  chatbotId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  documents: [
    {
      fileName: String,
      path: String
    }
  ],
  processedContent: [
    {
      fileName: String,
      content: String
    }
  ],
  conversations: [
    {
      userMessage: String,
      aiResponse: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ChatbotModel = mongoose.model('Chatbot', chatbotSchema);

module.exports = { ChatbotModel };