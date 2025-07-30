import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Brain, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface WelcomeScreenProps {
  userName: string;
  setUserName: (value: string) => void;
  userInput: string;
  setUserInput: (value: string) => void;
  onStart: () => void;
  isGenerating: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName,
  setUserName,
  userInput,
  setUserInput,
  onStart,
  isGenerating,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/lovable-uploads/6e675002-23f2-405d-91fe-2e2b48323d6c.png" 
                alt="FractionalAI Logo" 
                className="w-24 h-24 object-contain"
              />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Ideation Blueprint
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Transform your ideas into actionable development blueprints. 
            Get AI-powered analysis, intelligent workflows, and personalized Lovable prompts 
            to bring your vision to life.
          </motion.p>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {[
            {
              icon: Brain,
              title: 'AI Analysis',
              description: 'Advanced semantic analysis of your ideas with context-aware understanding'
            },
            {
              icon: Zap,
              title: 'Smart Workflows',
              description: 'Intelligent step-by-step development workflows tailored to your project'
            },
            {
              icon: Lightbulb,
              title: 'Lovable Prompts',
              description: 'Ready-to-use prompts optimized for the Lovable development platform'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-12 h-12 text-primary mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-card backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-3 text-foreground">
                Describe Your Vision
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Share your idea, project concept, or development challenge. 
                The more details you provide, the better your blueprint will be.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-sm font-medium text-foreground">
                    Your Name
                  </Label>
                  <Input
                    id="userName"
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-input/50 border-border/50 focus:border-primary/50 focus:bg-input transition-all duration-300"
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="userInput" className="text-sm font-medium text-foreground">
                    Describe Your Vision
                  </Label>
                  <Textarea
                    id="userInput"
                    placeholder="I want to build an app that helps people..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[150px] text-base leading-relaxed resize-none bg-input/50 border-border/50 focus:border-primary/50 focus:bg-input transition-all duration-300"
                    disabled={isGenerating}
                  />
                  <div className="text-sm text-muted-foreground">
                    💡 Try to include: your target audience, main features, technology preferences, design preferences, and any constraints
                  </div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onStart}
                  disabled={!userName.trim() || !userInput.trim() || isGenerating}
                  className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-primary-foreground shadow-elegant transition-all duration-300"
                >
                  {isGenerating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 mr-3 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                      AI Analyzing Your Vision...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-5 w-5" />
                      Start Your Journey
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;