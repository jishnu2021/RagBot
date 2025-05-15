import { useState } from 'react';
import axios from 'axios';
import { toast } from './use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rag-chatbot-backend-iqiy.onrender.com/api';

/**
 * Custom hook for chatbot creation
 */
export const useChatbot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [chatbotData, setChatbotData] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Create a new chatbot
   * @param {Object} data - Bot configuration data
   * @param {string} data.botName - Name of the chatbot
   * @param {string} data.botDescription - Description of the chatbot
   * @param {File[]} data.documents - Array of document files
   */
  const createChatbot = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('botName', data.botName);
      formData.append('botDescription', data.botDescription || '');
      
      // Append all files to the form data
      if (data.documents && data.documents.length > 0) {
        data.documents.forEach(file => {
          formData.append('documents', file);
        });
      }
      
      const response = await axios.post(`${API_URL}/chatbots`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setChatbotData(response.data);
        setIsGenerated(true);
        toast({
          title: "Success!",
          description: "Your chatbot has been created successfully.",
        });
      } else {
        setError(response.data.message || 'Failed to create chatbot');
        toast({
          title: "Error",
          description: response.data.message || 'Failed to create chatbot',
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset chatbot creation state
   */
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
    resetChatbot
  };
};