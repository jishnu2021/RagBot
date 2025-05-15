import { useState } from 'react';
import apiService, { ChatbotResponse } from '../services/apiService';

export const useChatbot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatbotData, setChatbotData] = useState<ChatbotResponse | null>(null);

  const createChatbot = async ({ botName, botDescription, documents }: {
    botName: string;
    botDescription: string;
    documents: File[];
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.createChatbot({
        botName,
        botDescription,
        documents
      });
      
      setChatbotData(data);
      setIsGenerated(true);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred creating the chatbot';
      setError(errorMessage);
      console.error('Error creating chatbot:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const askQuestion = async (chatbotId: string, question: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.askQuestion(chatbotId, { question });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred asking the question';
      setError(errorMessage);
      console.error('Error asking question:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetChatbot = () => {
    setIsGenerated(false);
    setChatbotData(null);
    setError(null);
  };

  return { 
    isLoading, 
    isGenerated, 
    chatbotData, 
    error,
    createChatbot, 
    askQuestion,
    resetChatbot 
  };
};
