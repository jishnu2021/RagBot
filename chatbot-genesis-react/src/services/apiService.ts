import axios, { AxiosError } from 'axios';

// Determine the API URL based on the environment
const getApiUrl = () => {
  // For production build, use environment variable or default to the render.com URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://rag-chatbot-backend.onrender.com';
  }
  // For development, use localhost
  return 'http://localhost:5000';
};

// Create base URLs
const BASE_URL = getApiUrl();
const API_URL = `${BASE_URL}/api`;

// Create axios instance with appropriate configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increased to 60 seconds for normal requests
  // Enable credentials to send cookies in cross-origin requests if needed
  withCredentials: false,
});

// Create a separate client for file uploads with longer timeout
const uploadClient = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutes for file uploads
  withCredentials: false,
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - is the backend server running?', error.message);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timed out - the operation is taking too long to complete', error.message);
    }
    
    // Log the error for debugging
    console.error('API error:', {
      message: error.message,
      endpoint: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Apply the same interceptors to the upload client
uploadClient.interceptors.request.use(
  (config) => {
    console.log(`Making upload request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Upload request error:', error);
    return Promise.reject(error);
  }
);

uploadClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      console.error('File upload timed out - try with smaller or fewer files', error.message);
    }
    return Promise.reject(error);
  }
);

// Chatbot interfaces
export interface ChatbotCreateRequest {
  botName: string;
  botDescription: string;
  documents: File[];
}

export interface ChatbotResponse {
  chatbotId: string;
  botName: string;
  botDescription: string;
  chatbotLink: string;
  qrCodeLink: string;
  documentCount: number;
  chunkCount: number;
}

export interface AskQuestionRequest {
  question: string;
}

export interface AskQuestionResponse {
  answer: string;
  sourceDocs?: {
    text: string;
    score: number;
  }[];
}

// API methods
const apiService = {
  // Check if backend is available
  checkHealth: async (): Promise<boolean> => {
    try {
      // Try health endpoint first
      try {
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
        return response.status === 200;
      } catch (err: any) {
        // If health endpoint returns 404, the server might still be running but without the health endpoint
        // Try the root endpoint instead
        if (err.response && err.response.status === 404) {
          console.log('Health endpoint not found, trying root endpoint...');
          const rootResponse = await axios.get(BASE_URL, { timeout: 5000 });
          // If we get any successful response from the root, the server is running
          return rootResponse.status >= 200 && rootResponse.status < 500;
        }
        throw err; // Re-throw for other errors
      }
    } catch (err) {
      console.error('Backend health check failed:', err);
      return false;
    }
  },
  
  // Chatbot creation
  createChatbot: async (data: ChatbotCreateRequest): Promise<ChatbotResponse> => {
    const formData = new FormData();
    formData.append('botName', data.botName);
    formData.append('botDescription', data.botDescription);
    
    // Log file information before uploading
    console.log(`Uploading ${data.documents.length} files:`, 
      data.documents.map(f => `${f.name} (${Math.round(f.size/1024)}KB)`));
    
    // Append each document to FormData
    data.documents.forEach((doc) => {
      formData.append('documents', doc);
    });
    
    try {
      // Use the upload client with longer timeout
      const response = await uploadClient.post('/chatbots', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      
      return response.data;
    } catch (error: any) {
      // More detailed error logging for upload issues
      if (error.code === 'ECONNABORTED') {
        console.error('The upload request timed out. Try with smaller or fewer files.');
      }
      throw error;
    }
  },
  
  // Get all chatbots
  getAllChatbots: async () => {
    const response = await apiClient.get('/chatbots');
    return response.data;
  },
  
  // Get a specific chatbot
  getChatbot: async (chatbotId: string) => {
    const response = await apiClient.get(`/chatbots/${chatbotId}`);
    return response.data;
  },
  
  // Ask a question to a chatbot
  askQuestion: async (chatbotId: string, data: AskQuestionRequest): Promise<AskQuestionResponse> => {
    const response = await apiClient.post(`/chatbots/${chatbotId}/ask`, data);
    return response.data;
  },
};

export default apiService; 