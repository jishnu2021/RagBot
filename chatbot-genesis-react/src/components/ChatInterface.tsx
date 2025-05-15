import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, AlertCircle, ArrowDown, Image, Paperclip, Smile } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useChatbot } from '../hook/useChatbot';
import apiService from '../services/apiService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  chatbotId: string;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const ChatInterface = ({ chatbotId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatbotDetails, setChatbotDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { askQuestion } = useChatbot();

  // Fetch chatbot details on mount
  useEffect(() => {
    const fetchChatbotDetails = async () => {
      try {
        setLoading(true);
        const details = await apiService.getChatbot(chatbotId);
        setChatbotDetails(details);
        
        // Add welcome message
        setMessages([
          {
            role: 'bot',
            content: `Hi there! I'm ${details.botName}. ${details.botDescription} Ask me anything about the documents I've been trained on.`,
            timestamp: new Date()
          }
        ]);
      } catch (err: any) {
        console.error('Error fetching chatbot details:', err);
        setError(err.message || 'Failed to load chatbot details');
      } finally {
        setLoading(false);
      }
    };

    fetchChatbotDetails();
  }, [chatbotId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Setup scroll detection for the scroll-to-bottom button
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      // Show button when not at bottom (with a small threshold)
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);
    
    try {
      // Send to backend
      const response = await askQuestion(chatbotId, userMessage.content);
      
      if (response) {
        // Add bot response
        const botMessage: Message = {
          role: 'bot',
          content: response.answer,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response from chatbot');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Error communicating with the chatbot');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(timestamp);
  };

  if (!chatbotDetails && !loading && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <Bot className="h-12 w-12 text-primary/30 mb-4" />
          <p className="text-muted-foreground">Loading chatbot...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-600">Error</AlertTitle>
        <AlertDescription className="text-red-600">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[600px] border rounded-xl overflow-hidden shadow-lg bg-background">
      {/* Chat header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{chatbotDetails?.botName || 'Chatbot'}</h3>
            {chatbotDetails?.botDescription && (
              <p className="text-sm text-muted-foreground line-clamp-1">{chatbotDetails.botDescription}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">
          {chatbotDetails?.documentCount} documents · {chatbotDetails?.chunkCount} chunks
        </div>
      </div>
      
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 to-slate-50 dark:from-gray-900/20 dark:to-gray-900/10"
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div 
                className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-sm",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-white dark:bg-gray-800 border rounded-tl-none"
                )}
              >
                <div className="flex justify-between items-center mb-1 text-xs opacity-80">
                  <span>{message.role === 'user' ? 'You' : chatbotDetails?.botName || 'Chatbot'}</span>
                  <span className="ml-2 opacity-70">{formatTimestamp(message.timestamp)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-white dark:bg-gray-800 border rounded-2xl rounded-tl-none p-3 max-w-[85%] sm:max-w-[75%] shadow-sm">
              <div className="flex items-center mb-1 text-xs opacity-80">
                <span>{chatbotDetails?.botName || 'Chatbot'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="h-2 w-2 bg-primary/60 rounded-full"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                />
                <motion.div 
                  className="h-2 w-2 bg-primary/60 rounded-full"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                />
                <motion.div 
                  className="h-2 w-2 bg-primary/60 rounded-full"
                  animate={{ scale: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="sticky bottom-4 flex justify-center">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={scrollToBottom}
              className="bg-primary text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <ArrowDown className="h-4 w-4" />
            </motion.button>
          </div>
        )}
        
        {/* Anchor for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t bg-background">
        <form 
          className="flex space-x-2 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <div className="flex-1 relative">
            <Input
              className="pr-24 py-6 text-base focus-visible:ring-primary"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100" disabled={loading}>
                <Smile className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-70 hover:opacity-100" disabled={loading}>
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            disabled={loading || !inputValue.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Powered by Retrieval-Augmented Generation
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 