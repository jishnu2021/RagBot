
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small businesses and personal use.",
    features: [
      "Up to 1GB of document storage",
      "1 custom chatbot",
      "Basic analytics",
      "Standard support",
      "Website embedding"
    ],
    cta: "Start Free Trial"
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "For growing businesses with advanced needs.",
    features: [
      "Up to 10GB of document storage",
      "5 custom chatbots",
      "Advanced analytics",
      "Priority support",
      "Website & app embedding",
      "Custom branding"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with specific requirements.",
    features: [
      "Unlimited document storage",
      "Unlimited chatbots",
      "Advanced analytics & reporting",
      "Dedicated account manager",
      "API access",
      "SSO integration",
      "Custom training & onboarding"
    ],
    cta: "Contact Sales"
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that works best for your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`border ${plan.popular ? 'border-primary' : 'border-border'} rounded-xl overflow-hidden bg-card relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-end mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
              <div className="border-t border-border p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Need a custom plan for your specific needs?
          </p>
          <Button variant="outline" size="lg">
            Contact Our Sales Team
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
