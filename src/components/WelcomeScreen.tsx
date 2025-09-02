import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Brain, ArrowRight, Zap, CheckCircle2, Users, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface WelcomeScreenProps {
  userName: string;
  setUserName: (value: string) => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
  userInput: string;
  setUserInput: (value: string) => void;
  onStart: () => void;
  isGenerating: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName,
  setUserName,
  userEmail,
  setUserEmail,
  userInput,
  setUserInput,
  onStart,
  isGenerating,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center justify-center section-padding">
        <div className="container-width text-center relative z-10">
          <div className="animate-fade-in-up">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <img 
                src="/lovable-uploads/c7b74152-d8c0-44a0-ab35-c7836d10e587.png" 
                alt="AI MindMaker Logo" 
                className="w-[70px] h-[70px] object-contain mx-auto"
              />
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 
              className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-8 leading-tight mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Transform Ideas Into
              <br />
              <span className="text-primary">Development Blueprints</span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              className="body-lg text-muted-foreground mb-12 max-w-2xl mx-auto text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Get AI-powered development roadmaps tailored for rapid prototyping. 
              From concept to code-ready blueprint in minutes.
            </motion.p>

            {/* Main Input Card */}
            <motion.div
              id="main-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-16"
            >
              <Card className="card-hover border-0 shadow-sm bg-card/50 backdrop-blur-sm max-w-2xl mx-auto">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="headline-md">Share Your Vision</CardTitle>
                  </div>
                  <CardDescription className="body-md text-muted-foreground">
                    Tell us about your project and we'll create a personalized development blueprint
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 px-8 pb-8">
                  {/* User Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-sm font-medium text-foreground">
                        Your Name
                      </Label>
                      <Input
                        id="userName"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="h-12 transition-all duration-300 focus:scale-[1.01]"
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userEmail" className="text-sm font-medium text-foreground">
                        Email Address
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="h-12 transition-all duration-300 focus:scale-[1.01]"
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                  
                  {/* Project Vision */}
                  <div className="space-y-3">
                    <Label htmlFor="userInput" className="text-sm font-medium text-foreground">
                      Project Vision
                    </Label>
                    <Textarea
                      id="userInput"
                      placeholder="I want to build an app that helps people..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="min-h-[140px] text-base resize-none transition-all duration-300 focus:scale-[1.01]"
                      disabled={isGenerating}
                    />
                    <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <strong>Pro tip:</strong> Include your target audience, key features, and technical preferences for the most accurate blueprint
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-4"
                  >
                    <Button
                      onClick={onStart}
                      disabled={!userName.trim() || !userEmail.trim() || !userInput.trim() || isGenerating}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 mr-3 border-2 border-primary-foreground border-t-transparent rounded-full"
                          />
                          Creating Your Blueprint...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-3 h-5 w-5" />
                          Generate My Development Blueprint
                          <ArrowRight className="ml-3 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature Benefits - Below the Fold */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h2 className="headline-lg mb-6">Why Choose Our Blueprint System?</h2>
              <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
                Get development-ready roadmaps designed for rapid prototyping and real-world implementation
              </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div 
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              {[
                {
                  icon: Brain,
                  title: 'AI-Powered Analysis',
                  description: 'Advanced AI analyzes your vision and generates comprehensive development strategies tailored to your goals.'
                },
                {
                  icon: Zap,
                  title: 'Rapid Prototyping Ready',
                  description: 'Get actionable blueprints optimized for quick development cycles and iterative improvement.'
                },
                {
                  icon: CheckCircle2,
                  title: 'Production-Grade Planning',
                  description: 'Detailed roadmaps include architecture, tech stack, and implementation steps for real applications.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                >
                  <Card className="card-hover border-0 shadow-sm bg-card/50 backdrop-blur-sm h-full">
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-semibold mb-3">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20"></div>
        </div>
      </section>
    </div>
  );
};

export default WelcomeScreen;