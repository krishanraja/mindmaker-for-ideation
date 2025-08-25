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
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img 
                src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" 
                alt="FractionalAI Logo" 
                className="w-20 h-20 object-contain mx-auto"
              />
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-8 text-foreground tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Ideation Blueprint
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
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
          className="grid md:grid-cols-3 gap-8 mb-20 max-w-4xl mx-auto"
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
              <Card className="bg-card/50 backdrop-blur-sm border-border/30 hover:border-border/60 transition-all duration-300 group h-full">
                <CardContent className="p-8 text-center h-full flex flex-col items-center justify-center">
                  <feature.icon className="w-14 h-14 text-primary mb-6 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-semibold text-xl mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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
          className="max-w-3xl mx-auto"
        >
          <Card className="bg-card/60 backdrop-blur-sm border border-border/40 shadow-lg">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Describe Your Vision
              </CardTitle>
              <CardDescription className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                Share your idea, project concept, or development challenge. 
                The more details you provide, the better your blueprint will be.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 px-8 pb-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="userName" className="text-sm font-medium text-foreground">
                      Your Name
                    </Label>
                    <Input
                      id="userName"
                      placeholder="Enter your name..."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:bg-background transition-all duration-300"
                      disabled={isGenerating}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="userEmail" className="text-sm font-medium text-foreground">
                      Your Email
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="h-12 bg-background/50 border-border/60 focus:border-primary/50 focus:bg-background transition-all duration-300"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="userInput" className="text-sm font-medium text-foreground">
                    Describe Your Vision
                  </Label>
                  <Textarea
                    id="userInput"
                    placeholder="I want to build an app that helps people..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="min-h-[140px] text-base leading-relaxed resize-none bg-background/50 border-border/60 focus:border-primary/50 focus:bg-background transition-all duration-300"
                    disabled={isGenerating}
                  />
                  <div className="text-sm text-muted-foreground/80 bg-muted/20 p-3 rounded-lg">
                    💡 <strong>Tip:</strong> Include your target audience, main features, technology preferences, and any design constraints
                  </div>
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
                  className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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