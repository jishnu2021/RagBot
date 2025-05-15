import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QrCode, Link, FileText, AlertCircle, Server } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useChatbot } from "../hook/useChatbot.ts";
import apiService from "../services/apiService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ChatbotBuilder = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Use the custom chatbot hook
  const { 
    isLoading, 
    isGenerated, 
    chatbotData,
    error,
    createChatbot, 
    resetChatbot 
  } = useChatbot();

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const isHealthy = await apiService.checkHealth();
        setBackendStatus(isHealthy ? 'online' : 'offline');
      } catch (err) {
        console.error('Error checking backend health:', err);
        setBackendStatus('offline');
      }
    };

    checkBackendConnection();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const generateChatbot = async () => {
    // Check backend connection first
    if (backendStatus === 'offline') {
      toast({
        title: "Backend server is offline",
        description: "Please make sure the backend server is running on https://rag-chatbot-backend-iqiy.onrender.com",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No documents uploaded",
        description: "Please upload at least one document to create your chatbot.",
        variant: "destructive",
      });
      return;
    }

    if (!botName.trim()) {
      toast({
        title: "Bot name required",
        description: "Please provide a name for your chatbot.",
        variant: "destructive",
      });
      return;
    }

    // Call the createChatbot function from our hook
    const result = await createChatbot({
      botName,
      botDescription,
      documents: files
    });

    if (result) {
      toast({
        title: "Chatbot created!",
        description: "Your chatbot has been created successfully.",
      });
    }
  };

  const resetForm = () => {
    // Reset hook state
    resetChatbot();
    
    // Reset form fields
    setFiles([]);
    setBotName("");
    setBotDescription("");
  };

  const copyToClipboard = () => {
    if (chatbotData?.chatbotLink) {
      navigator.clipboard.writeText(chatbotData.chatbotLink);
      toast({
        title: "Link copied!",
        description: "Chatbot link copied to clipboard.",
      });
    }
  };

  const retryBackendConnection = async () => {
    setBackendStatus('checking');
    try {
      const isHealthy = await apiService.checkHealth();
      setBackendStatus(isHealthy ? 'online' : 'offline');
      
      if (isHealthy) {
        toast({
          title: "Connected!",
          description: "Successfully connected to the backend server.",
        });
      } else {
        toast({
          title: "Still offline",
          description: "The backend server is still offline. Please start it first.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error retrying backend connection:', err);
      setBackendStatus('offline');
      toast({
        title: "Connection failed",
        description: "Failed to connect to the backend server.",
        variant: "destructive",
      });
    }
  };

  // Show connection status alert
  const renderBackendStatus = () => {
    if (backendStatus === 'checking') {
      return (
        <Alert className="mb-6 bg-yellow-50 border-yellow-200">
          <Server className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">Checking Backend Connection</AlertTitle>
          <AlertDescription className="text-yellow-600">
            Verifying connection to the backend server...
          </AlertDescription>
        </Alert>
      );
    }
    
    if (backendStatus === 'offline') {
      return (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Backend Server Offline</AlertTitle>
          <AlertDescription className="text-red-600">
            <p className="mb-2">
              The backend server appears to be offline. Please ensure it's running on http://localhost:5000
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-red-200 text-red-600 hover:bg-red-100"
              onClick={retryBackendConnection}
            >
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="mb-6 bg-green-50 border-green-200">
        <Server className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">Backend Connected</AlertTitle>
        <AlertDescription className="text-green-600">
          Successfully connected to the backend server.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-12 md:py-16" style={{marginTop:'2rem'}}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Create Your Own Chatbot</h1>
            
            {/* Backend connection status */}
            {renderBackendStatus()}
            
            {/* Show error if any */}
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Error</AlertTitle>
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {!isGenerated ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">1. Bot Details</h2>
                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Chatbot Name</Label>
                    <Input 
                      id="bot-name" 
                      placeholder="My Company Bot" 
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bot-description">Bot Description (optional)</Label>
                    <Textarea 
                      id="bot-description" 
                      placeholder="This bot helps with customer queries about our products..." 
                      value={botDescription}
                      onChange={(e) => setBotDescription(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">2. Upload Documents</h2>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="mb-4 text-muted-foreground">Upload PDFs, DOCs, TXTs, or other text documents</p>
                    <Input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                      multiple
                    />
                    <Label htmlFor="file-upload">
                      <Button variant="outline" className="mb-2" asChild>
                        <span>Choose Files</span>
                      </Button>
                    </Label>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-medium mb-2">Uploaded Files ({files.length})</h3>
                      <div className="border rounded-md divide-y">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              <span className="text-sm truncate max-w-[200px] md:max-w-xs">
                                {file.name}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({Math.round(file.size / 1024)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={generateChatbot}
                  disabled={isLoading || backendStatus !== 'online'}
                  className="w-full purple-gradient text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                      Creating Your Chatbot...
                    </>
                  ) : (
                    "Generate Document Chatbot"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-8 border rounded-xl p-6 bg-background shadow-sm">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Your Chatbot is Ready!</h2>
                  <p className="text-muted-foreground mb-6">
                    Share this link or QR code to let others interact with your document-trained chatbot.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Chatbot Link</Label>
                    <div className="flex">
                      <Input value={chatbotData?.chatbotLink || ""} readOnly className="flex-1 bg-muted" />
                      <Button 
                        onClick={copyToClipboard}
                        className="ml-2"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Chatbot QR Code</Label>
                    <div className="border rounded-lg p-6 flex items-center justify-center bg-white">
                      {chatbotData?.qrCodeLink && (
                        <img 
                          src={chatbotData.qrCodeLink}
                          alt="Chatbot QR Code" 
                          className="h-48 w-48"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      onClick={resetForm}
                      variant="outline"
                      className="sm:flex-1"
                    >
                      Create New Chatbot
                    </Button>
                    <Button 
                      onClick={() => window.open(chatbotData?.chatbotLink, '_blank')}
                      className="purple-gradient text-white sm:flex-1"
                    >
                      Open Chatbot
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatbotBuilder;