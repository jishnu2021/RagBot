
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden">
          <div className="relative p-8 md:p-16 purple-gradient text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-700/90"></div>
            <div className="relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your Documents Into an Interactive AI Experience</h2>
                <p className="text-lg md:text-xl opacity-90 mb-8">
                  Join thousands of businesses using RagBot to create intelligent chatbots that deliver precise, document-based answers.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="bg-white text-foreground hover:bg-white/90 w-full sm:w-auto" asChild>
                    <Link to="/build">
                      Start Building Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    See Pricing Plans
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
