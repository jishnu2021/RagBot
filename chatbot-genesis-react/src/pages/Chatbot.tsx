import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';
import apiService from '@/services/apiService';

const Chatbot = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatbotExists, setChatbotExists] = useState(false);
  
  useEffect(() => {
    const checkChatbot = async () => {
      if (!chatbotId) {
        setError('No chatbot ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const result = await apiService.checkHealth();
        
        if (!result) {
          setError('Backend server is offline. Please ensure the server is running.');
          setLoading(false);
          return;
        }
        
        // Check if chatbot exists
        try {
          await apiService.getChatbot(chatbotId);
          setChatbotExists(true);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setError('Chatbot not found. It may have been deleted or the ID is incorrect.');
          } else {
            setError('Failed to load chatbot: ' + (err.message || 'Unknown error'));
          }
        }
      } catch (err: any) {
        setError('Error connecting to server: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    checkChatbot();
  }, [chatbotId]);
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4">Loading chatbot...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 container mx-auto px-4">
        {error ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-600">Error</AlertTitle>
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="text-center pt-4">
              <Button onClick={() => navigate('/')} variant="outline" className="mr-4">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
              
              <Button onClick={() => navigate('/create')} className="purple-gradient text-white">
                Create a New Chatbot
              </Button>
            </div>
          </div>
        ) : chatbotExists && chatbotId ? (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Chat with Your Document Bot</h1>
            <ChatInterface chatbotId={chatbotId} />
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Chatbot; 