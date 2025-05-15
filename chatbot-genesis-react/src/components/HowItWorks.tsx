
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Upload Your Documents",
    description: "Simply drag and drop your PDFs, DOCs, TXT files, or other document formats into our platform.",
    image: "https://images.unsplash.com/photo-1586282391129-76a6df230234?q=80&w=1000&auto=format&fit=crop"
  },
  {
    number: "02",
    title: "AI Processes Your Content",
    description: "Our system reads, analyzes, and creates embeddings from your documents to understand the information.",
    image: "https://images.unsplash.com/photo-1526378787940-576a539ba69d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    number: "03",
    title: "Train Your Custom Chatbot",
    description: "The AI learns from your content to create a custom chatbot that can answer questions specifically about your documents.",
    image: "https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?q=80&w=1000&auto=format&fit=crop"
  },
  {
    number: "04",
    title: "Deploy Anywhere",
    description: "Integrate your chatbot on your website, app, or use our hosted solution with a simple embed code.",
    image: "https://images.unsplash.com/photo-1548092372-0d1bd40894a3?q=80&w=1000&auto=format&fit=crop"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How RagBot Works</h2>
          <p className="text-lg text-muted-foreground">
            Creating your custom AI chatbot is simple and straightforward. Follow these steps to get started.
          </p>
        </div>

        <div className="space-y-24 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              <div className="w-full md:w-1/2">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-16 h-16 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
                    {step.number}
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border aspect-video shadow-xl">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {step.description}
                </p>
                {index === steps.length - 1 && (
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
