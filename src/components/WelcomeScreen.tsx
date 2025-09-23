import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import mindmakerLogo from '@/assets/mindmaker-logo.png';

interface WelcomeScreenProps {
  userName: string;
  setUserName: (value: string) => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
  projectInput: string;
  setProjectInput: (value: string) => void;
  onStart: () => void;
  isGenerating: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  projectInput,
  setProjectInput,
  onStart,
  isGenerating,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={mindmakerLogo} 
            alt="MindMaker Logo" 
            className="w-16 h-16 mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-[-0.03em] md:tracking-[-0.035em]">
            Idea-to-AI Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Transform your ideas into development blueprints with AI-powered analysis
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="userName"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isGenerating}
                className="h-12"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="your@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled={isGenerating}
                className="h-12"
              />
            </div>

            {/* Project Vision */}
            <div className="space-y-2">
              <Label htmlFor="projectInput" className="text-sm font-medium">
                Project Vision
              </Label>
              <Textarea
                id="projectInput"
                placeholder="I want to build an app that helps people..."
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                disabled={isGenerating}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* CTA Button */}
            <Button
              onClick={onStart}
              disabled={!userName.trim() || !userEmail.trim() || !projectInput.trim() || isGenerating}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating Blueprint...
                </>
              ) : (
                <>
                  Generate Blueprint
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Pro Tip */}
            <p className="text-xs text-muted-foreground text-center mt-4">
              Include your target audience and key features for better results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;