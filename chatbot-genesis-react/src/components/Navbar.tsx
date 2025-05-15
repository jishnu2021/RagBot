
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { title: "Features", href: "#features" },
    { title: "How It Works", href: "#how-it-works" },
    { title: "Demo", href: "#demo" },
    { title: "Pricing", href: "#pricing" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
       <Link to='/'><span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-700">RagBot</span></Link>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a 
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
            Try For Free
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="px-4 py-8 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-700">RagBot</span>
              </div>
              
              <ul className="flex flex-col gap-4">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Log In
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800" onClick={() => setIsOpen(false)}>
                  Try For Free
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
