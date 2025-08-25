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
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Compact Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" 
                alt="FractionalAI Logo" 
                className="w-30 h-30 object-contain mx-auto"
              />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-3 text-foreground tracking-tight"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Ideation Blueprint
          </motion.h1>
          
          <motion.p 
            className="text-base text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Transform your ideas into actionable development blueprints with AI
          </motion.p>
        </motion.div>

        {/* Main Input Section - The Star */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-12"
        >
          <Card className="bg-card border-2 border-primary/20 shadow-2xl shadow-primary/5 hover:border-primary/30 transition-all duration-300">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold mb-3 text-foreground">
                Describe Your Vision
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Share your idea and get a personalized development blueprint
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-sm font-medium text-foreground">
                    Your Name
                  </Label>
                  <Input
                    id="userName"
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-11 bg-background border-border/60 focus:border-primary transition-all duration-300"
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userEmail" className="text-sm font-medium text-foreground">
                    Your Email
                  </Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-11 bg-background border-border/60 focus:border-primary transition-all duration-300"
                    disabled={isGenerating}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="userInput" className="text-sm font-medium text-foreground">
                  Your Project Vision
                </Label>
                <Textarea
                  id="userInput"
                  placeholder="I want to build an app that helps people..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[120px] text-base resize-none bg-background border-border/60 focus:border-primary transition-all duration-300"
                  disabled={isGenerating}
                />
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  💡 <strong>Tip:</strong> Include your target audience, key features, and any technical preferences
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="pt-2"
              >
                <Button
                  onClick={onStart}
                  disabled={!userName.trim() || !userEmail.trim() || !userInput.trim() || isGenerating}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate My Blueprint
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features as Social Proof - Subtle and Below */}
        <motion.div 
          className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto opacity-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            {
              icon: Brain,
              title: 'AI Analysis',
              description: 'Smart analysis of your ideas'
            },
            {
              icon: Zap,
              title: 'Custom Workflows',
              description: 'Tailored development steps'
            },
            {
              icon: Lightbulb,
              title: 'Lovable Ready',
              description: 'Optimized for rapid development'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="bg-card/30 backdrop-blur-sm border border-border/20 rounded-lg p-4 hover:bg-card/40 transition-all duration-300">
                <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="w-6 h-6 text-primary/80" />
                </div>
                <h3 className="font-medium text-sm mb-1 text-foreground/90">{feature.title}</h3>
                <p className="text-xs text-muted-foreground/80">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;