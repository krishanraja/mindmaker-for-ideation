import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card } from "@/components/ui/card";
import { Lightbulb, GraduationCap } from "lucide-react";

export default function Auth() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MindMaker AI Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive platform for AI ideation and literacy
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">AI Ideation</h2>
            </div>
            <p className="text-muted-foreground">
              Generate comprehensive business blueprints and AI strategies tailored to your needs.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">AI Literacy</h2>
            </div>
            <p className="text-muted-foreground">
              Build your AI knowledge with interactive exercises and daily challenges.
            </p>
          </Card>
        </div>

        <div className="flex justify-center">
          <Card className="p-8">
            {showLogin ? (
              <LoginForm onSwitchToSignup={() => setShowLogin(false)} />
            ) : (
              <SignupForm onSwitchToLogin={() => setShowLogin(true)} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
