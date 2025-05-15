
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden py-20 lg:py-24">
      <div className="absolute inset-0 bg-grid dark:bg-grid-dark"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/95 to-background/80"></div>
      
      <div className="relative container mx-auto px-4 pt-16 md:pt-20 lg:pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full border border-border bg-muted/50 text-sm font-medium text-foreground/80 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Powered by latest LLM technology
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in" style={{animationDelay: "0.1s"}}>
            Create Custom AI Chatbots from <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Your Documents</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{animationDelay: "0.2s"}}>
            Upload your PDFs, DOCs, and more to train an AI that answers questions about your content. Deploy it anywhere in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{animationDelay: "0.3s"}}>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 w-full sm:w-auto" asChild>
              <Link to="/build">Start Building Now</Link>
            </Button>
            <Button variant="outline" size="lg" className="group w-full sm:w-auto">
              See How It Works
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-border animate-fade-in" style={{animationDelay: "0.4s"}}>
          <div className="bg-muted/30 w-full p-3 border-b border-border flex items-center">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="bg-background">
            <div className="grid md:grid-cols-5 min-h-[400px]">
              <div className="md:col-span-2 border-r border-border p-4">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Upload Documents</div>
                    <div className="h-28 rounded-lg border border-dashed border-border bg-muted/50 flex items-center justify-center">
                      <div className="text-sm text-muted-foreground text-center">
                        <div>Drag & drop files here</div>
                        <div>or click to browse</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Uploaded Files</div>
                    <div className="space-y-2">
                      {["company_handbook.pdf", "product_specs.docx", "faq.txt"].map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <span className="text-sm truncate">{file}</span>
                          <span className="text-xs text-muted-foreground">Processed</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 p-4">
                <div className="flex flex-col h-full">
                  <div className="flex-1 mb-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">U</span>
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-sm max-w-[80%]">
                          What's the return policy for damaged products?
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">AI</span>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3 text-sm max-w-[80%]">
                          Based on your company handbook, damaged products can be returned within 30 days of purchase with original receipt. Customers will receive a full refund or replacement at their discretion. For items damaged during shipping, please include photos of the packaging and damaged item when submitting your claim.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ask about your documents..."
                      className="w-full pl-4 pr-12 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button size="icon" className="absolute right-1 top-1 bg-primary hover:bg-primary/90 h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
};

export default Hero;
