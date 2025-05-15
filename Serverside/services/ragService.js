/**
 * RAG (Retrieval-Augmented Generation) service
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { processDocument } = require('../utils/documentProcessor');
const { chunkText } = require('../utils/textChunker');
const VectorStore = require('../utils/vectorStore');
const fs = require('fs').promises;
const path = require('path');

class RagService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    this.vectorStores = {}; // Map of chatbotId -> VectorStore
  }

  /**
   * Create a new chatbot based on uploaded documents
   * @param {string} chatbotId - Unique ID for the chatbot
   * @param {string} botName - Name of the chatbot
   * @param {string} botDescription - Description of the chatbot
   * @param {Array} files - Array of uploaded files
   */
  async createChatbot(chatbotId, botName, botDescription, files) {
    try {
      console.log(`Creating chatbot ${chatbotId} with ${files.length} files`);
      
      // Create vector store for this chatbot
      this.vectorStores[chatbotId] = new VectorStore(this.apiKey);
      
      // Process each file with better error handling
      let processedFiles = 0;
      let totalChunks = 0;
      
      // Process files sequentially for better memory management
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        try {
          console.log(`Processing file ${index + 1}/${files.length}: ${file.originalname}`);
          
          // Set a more aggressive limit on document size
          const maxTextLength = 50000; // ~50k characters (~10 pages)
          
          // Process document with streaming to reduce memory usage
          const text = await processDocument(file.path);
          
          // Truncate text if too large
          const truncatedText = text.length > maxTextLength 
            ? text.substring(0, maxTextLength) + `\n\n[Content truncated due to length: ${Math.round(text.length/1000)}k characters]` 
            : text;
          
          // Free up memory
          const textLength = truncatedText.length;
          
          // Use smaller chunks and smaller overlap
          const chunks = chunkText(truncatedText, 500, 100);
          console.log(`File ${index + 1} generated ${chunks.length} chunks`);
          
          // Add to vector store with file metadata - in smaller batches
          const batchSize = 20;
          for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            await this.vectorStores[chatbotId].addDocuments(batch, {
              botName,
              botDescription,
              chatbotId,
              fileName: file.originalname,
              fileIndex: index
            });
            
            // Force garbage collection if available
            if (global.gc) {
              global.gc();
            }
          }
          
          processedFiles++;
          totalChunks += chunks.length;
          
        } catch (err) {
          console.error(`Error processing file ${file.originalname}:`, err);
        }
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      // Save metadata for the chatbot
      await this.saveChatbotMetadata(chatbotId, botName, botDescription, files.map((file, index) => ({
        originalname: file.originalname,
        path: file.path,
        chunkCount: 0 // We'll update this later
      })));
      
      return {
        chatbotId,
        botName,
        botDescription,
        documentCount: files.length,
        processedCount: processedFiles,
        chunkCount: totalChunks
      };
    } catch (error) {
      console.error(`Error creating chatbot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save chatbot metadata for persistence
   */
  async saveChatbotMetadata(chatbotId, botName, botDescription, files) {
    try {
      // Read existing chatbots.json
      let chatbots = {};
      try {
        const chatbotsFile = await fs.readFile(path.join(__dirname, '../chatbots.json'), 'utf8');
        chatbots = JSON.parse(chatbotsFile);
      } catch (err) {
        // File doesn't exist or is invalid, start with empty object
      }
      
      // Add new chatbot
      chatbots[chatbotId] = {
        botName,
        botDescription,
        files,
        createdAt: new Date().toISOString()
      };
      
      // Save back to file
      await fs.writeFile(
        path.join(__dirname, '../chatbots.json'),
        JSON.stringify(chatbots, null, 2)
      );
    } catch (error) {
      console.error(`Error saving chatbot metadata: ${error.message}`);
      // Don't throw error here, it's not critical to the chatbot creation
    }
  }

  /**
   * Answer a question using RAG
   * @param {string} chatbotId - Chatbot ID
   * @param {string} question - User's question
   */
  async answerQuestion(chatbotId, question) {
    try {
      // Get or load vector store
      const vectorStore = await this.getVectorStore(chatbotId);
      if (!vectorStore) {
        throw new Error(`Chatbot ${chatbotId} not found`);
      }
      
      // Retrieve relevant documents
      const similarDocs = await vectorStore.similaritySearch(question, 5);
      
      if (similarDocs.length === 0) {
        return {
          answer: "I don't have enough information to answer that question."
        };
      }
      
      // Format context from relevant documents
      const context = similarDocs.map(doc => doc.text).join('\n\n');
      
      // Generate prompt for Gemini
      const prompt = [
        {
          role: 'user',
          parts: [
            {
              text: `You are a helpful assistant named "${vectorStore.documents[0]?.metadata?.botName || 'Assistant'}" with this description: "${vectorStore.documents[0]?.metadata?.botDescription || 'A helpful assistant'}".\n\nUse ONLY the following context to answer the question. If the answer is not in the context, say you don't know.\n\nContext:\n${context}\n\nQuestion: ${question}`
            }
          ]
        }
      ];
      
      // Call Gemini API
      const result = await this.model.generateContent({
        contents: prompt
      });
      
      return {
        answer: result.response.text(),
        sourceDocs: similarDocs.map(doc => ({
          text: doc.text.substring(0, 100) + '...',
          score: doc.score,
          fileName: doc.metadata?.fileName
        }))
      };
    } catch (error) {
      console.error(`Error answering question: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get or load the vector store for a chatbot
   */
  async getVectorStore(chatbotId) {
    // If already loaded, return it
    if (this.vectorStores[chatbotId]) {
      return this.vectorStores[chatbotId];
    }
    
    try {
      // Try to load from chatbots.json
      const chatbotsFile = await fs.readFile(path.join(__dirname, '../chatbots.json'), 'utf8');
      const chatbots = JSON.parse(chatbotsFile);
      
      if (!chatbots[chatbotId]) {
        return null;
      }
      
      // Create new vector store
      const vectorStore = new VectorStore(this.apiKey);
      
      // Process files and add to vector store
      for (const file of chatbots[chatbotId].files) {
        if (file.error) {
          console.warn(`Skipping file with previous error: ${file.originalname}`);
          continue;
        }
        
        try {
          const text = await processDocument(file.path);
          // Limit large documents
          const maxTextLength = 50000; // ~50k characters
          const truncatedText = text.length > maxTextLength 
            ? text.substring(0, maxTextLength) + `\n\n[Content truncated due to length: ${Math.round(text.length/1000)}k characters]` 
            : text;
            
          const chunks = chunkText(truncatedText, 500, 100);
          
          await vectorStore.addDocuments(chunks, {
            botName: chatbots[chatbotId].botName,
            botDescription: chatbots[chatbotId].botDescription,
            chatbotId,
            fileName: file.originalname
          });
        } catch (err) {
          console.error(`Error processing file ${file.originalname} on load:`, err);
        }
      }
      
      // Save for future use
      this.vectorStores[chatbotId] = vectorStore;
      
      return vectorStore;
    } catch (error) {
      console.error(`Error loading vector store: ${error.message}`);
      return null;
    }
  }
}

module.exports = RagService; 