import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb, GraduationCap } from "lucide-react";

export function MainNav() {
  const location = useLocation();
  const isIdeation = location.pathname === "/";
  const isLiteracy = location.pathname === "/literacy";

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" 
              alt="MindMaker" 
              className="h-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button 
                variant={isIdeation ? "default" : "ghost"}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                AI Ideation
              </Button>
            </Link>
            <Link to="/literacy">
              <Button 
                variant={isLiteracy ? "default" : "ghost"}
                className="gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                AI Literacy
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
