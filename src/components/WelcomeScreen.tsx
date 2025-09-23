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
    <div className="min-h-screen hero-gradient flex items-center justify-center mobile-padding section-padding">
      <div className="container-width fade-in-up">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-12">
          <img 
            src={mindmakerLogo} 
            alt="MindMaker Logo" 
            className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 hover-scale"
          />
          <h1 className="hero-heading hero-text-shimmer mb-6">
            Idea-to-AI Plan
          </h1>
          <p className="mobile-text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into development blueprints with AI-powered analysis
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card mobile-padding lg:p-10">
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
            <button
              onClick={onStart}
              disabled={!userName.trim() || !userEmail.trim() || !projectInput.trim() || isGenerating}
              className="btn-hero-primary w-full mobile-button"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Blueprint...
                </>
              ) : (
                <>
                  Generate Blueprint
                  <ArrowRight className="ml-3 h-5 w-5 animated-arrow" />
                </>
              )}
            </button>

            {/* Pro Tip */}
            <p className="text-sm text-muted-foreground/80 text-center mt-6 font-medium">
              💡 Include your target audience and key features for better results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;