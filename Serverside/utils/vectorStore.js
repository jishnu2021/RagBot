/**
 * Simple in-memory vector store for RAG implementation
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class VectorStore {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    this.documents = [];
    this.vectors = [];
  }

  /**
   * Add documents to the vector store
   * @param {string[]} texts - Array of text chunks to add
   * @param {Object} metadata - Metadata for the documents
   */
  async addDocuments(texts, metadata = {}) {
    try {
      for (const text of texts) {
        if (!text || text.trim() === '') continue;
        
        // Get embedding for the text chunk
        const result = await this.model.embedContent(text);
        const embedding = result.embedding.values;
        
        // Store document and its embedding
        this.documents.push({
          text,
          metadata: { ...metadata }
        });
        
        this.vectors.push(embedding);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding documents to vector store:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find similar documents based on a query
   * @param {string} query - The query to search for
   * @param {number} topK - Number of results to return
   */
  async similaritySearch(query, topK = 5) {
    try {
      if (this.documents.length === 0) {
        return [];
      }
      
      // Get embedding for the query
      const result = await this.model.embedContent(query);
      const queryEmbedding = result.embedding.values;
      
      // Calculate similarity scores
      const similarities = this.vectors.map((docVector, index) => ({
        index,
        score: this.cosineSimilarity(queryEmbedding, docVector)
      }));
      
      // Sort by similarity score (descending)
      const sortedResults = similarities.sort((a, b) => b.score - a.score);
      
      // Return top K results
      return sortedResults.slice(0, topK).map(result => ({
        ...this.documents[result.index],
        score: result.score
      }));
    } catch (error) {
      console.error('Error in similarity search:', error);
      throw error;
    }
  }
}

module.exports = VectorStore; 