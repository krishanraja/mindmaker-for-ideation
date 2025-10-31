import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb, GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function MainNav() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const isIdeation = location.pathname === "/ideation";
  const isLiteracy = location.pathname === "/literacy";

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/ideation">
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
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              @{profile?.username}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
