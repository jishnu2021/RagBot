import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, AlertCircle } from "lucide-react";
import apiService from "@/services/apiService";
import { useToast } from "@/components/ui/use-toast";

// Define proper types for chatbot data
interface Chatbot {
  id: string;
  botName: string;
  botDescription: string;
  chatbotLink: string;
  qrCodeLink?: string;
  documentCount: number;
  chunkCount: number;
}

const Demo = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! I'm your document-trained AI assistant. Ask me anything about the uploaded documents." }
  ]);
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch available chatbots on component mount
  useEffect(() => {
    const fetchChatbots = async () => {
      try {
        setError(null);
        const result = await apiService.getAllChatbots();
        const chatbotList = Object.entries(result.chatbots).map(([id, data]: [string, any]) => ({
          id,
          botName: data.botName,
          botDescription: data.botDescription || "",
          chatbotLink: data.chatbotLink,
          qrCodeLink: data.qrCodeLink,
          documentCount: data.documentCount || 0,
          chunkCount: data.chunkCount || 0
        }));
        setChatbots(chatbotList);
        
        // Auto-select the first chatbot if available
        if (chatbotList.length > 0) {
          setSelectedChatbot(chatbotList[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch chatbots:", err);
        setError("Unable to connect to the RAG service. Please ensure the backend server is running.");
        toast({
          title: "Connection Error",
          description: "Failed to connect to the chatbot service. Please check if the server is running.",
          variant: "destructive"
        });
      }
    };

    fetchChatbots();
  }, [toast]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedChatbot) return;
    
    // Add user message
    setMessages([...messages, { sender: "user", text: input }]);
    const userQuestion = input;
    setInput("");
    setIsTyping(true);
    setError(null);
    
    try {
      // Send question to the selected chatbot
      const response = await apiService.askQuestion(selectedChatbot, { question: userQuestion });
      
      setMessages(prev => [...prev, { sender: "bot", text: response.answer }]);
    } catch (err) {
      console.error("Error asking question:", err);
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: "Sorry, I encountered an error processing your question. Please try again later." 
      }]);
      
      toast({
        title: "Error",
        description: "Failed to get a response from the chatbot.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleChatbotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChatbot(e.target.value);
    // Reset conversation when changing chatbots
    setMessages([
      { sender: "bot", text: "Hi there! I'm your document-trained AI assistant. Ask me anything about the uploaded documents." }
    ]);
  };

  return (
    <section id="demo" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Try Our RAG Chatbot</h2>
          <p className="text-lg text-muted-foreground">
            Experience how our document-trained chatbot provides accurate, contextual answers based on uploaded content.
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="max-w-4xl mx-auto border border-border rounded-xl overflow-hidden shadow-lg">
          <div className="bg-muted/30 p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">AI</span>
              </div>
              <div>
                <div className="font-medium">RAG Chatbot</div>
                <div className="text-xs text-muted-foreground">
                  {selectedChatbot && chatbots.find(c => c.id === selectedChatbot)?.botDescription}
                </div>
              </div>
            </div>

            {chatbots.length > 0 && (
              <div>
                <select 
                  value={selectedChatbot || ''} 
                  onChange={handleChatbotChange}
                  className="text-sm rounded-md border border-border bg-background px-3 py-1"
                >
                  {chatbots.map(chatbot => (
                    <option key={chatbot.id} value={chatbot.id}>
                      {chatbot.botName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="h-[400px] md:h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted border border-border"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-lg bg-muted border border-border">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-border bg-background">
              <div className="flex">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={chatbots.length === 0 ? "No chatbots available..." : "Ask a question..."}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={chatbots.length === 0 || !selectedChatbot || isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  className="ml-2 bg-primary hover:bg-primary/90"
                  disabled={!input.trim() || chatbots.length === 0 || !selectedChatbot || isTyping}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {chatbots.length === 0 ? (
                <div className="text-xs text-center text-destructive mt-2">
                  No chatbots available. Create a chatbot first to start asking questions.
                </div>
              ) : (
                <div className="text-xs text-center text-muted-foreground mt-2">
                  Ask questions about the documents uploaded to the selected chatbot.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
