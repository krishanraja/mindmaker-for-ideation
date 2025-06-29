import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, Briefcase, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import ProgressRing from '@/components/ProgressRing';
import NeuronLoop from '@/components/NeuronLoop';
import ConversationStep from '@/components/ConversationStep';
import ProgressSidebar from '@/components/ProgressSidebar';

interface PathfinderSession {
  id: string;
  name: string;
  whyNow: string;
  coreSkills: string[];
  currentStep: number;
  progress: number;
}

const Index = () => {
  const [session, setSession] = useState<PathfinderSession>({
    id: '',
    name: '',
    whyNow: '',
    coreSkills: [],
    currentStep: 0,
    progress: 0
  });

  const [isStarted, setIsStarted] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const totalSteps = 7;

  const handleStart = () => {
    setIsStarted(true);
    setSession(prev => ({ ...prev, currentStep: 1, progress: 14 }));
  };

  const handleNext = () => {
    if (session.currentStep === 1 && inputValue.trim()) {
      setSession(prev => ({ 
        ...prev, 
        name: inputValue,
        currentStep: 2,
        progress: 28
      }));
      setInputValue('');
    } else if (session.currentStep === 2 && inputValue.trim()) {
      setSession(prev => ({ 
        ...prev, 
        whyNow: inputValue,
        currentStep: 3,
        progress: 42
      }));
      setInputValue('');
    } else if (session.currentStep === 3 && inputValue.trim()) {
      setSession(prev => ({ 
        ...prev, 
        coreSkills: inputValue.split(',').map(skill => skill.trim()),
        currentStep: 4,
        progress: 56
      }));
      setInputValue('');
    }
  };

  const renderWelcomeScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8 max-w-5xl mx-auto"
    >
      {/* Background Animation Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <NeuronLoop />
      </div>
      
      {/* Logo - Stable and Separate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="relative z-20 mb-8"
      >
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" 
            alt="Fractionl Logo" 
            className="w-24 h-24 object-contain"
            style={{ maxWidth: '96px', maxHeight: '96px' }}
          />
        </div>
      </motion.div>
      
      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-4">
          Pathfinder for Individuals
        </h1>
        <p className="text-xl text-purple-200 mb-8">
          Turn your ideas and superpowers into agent-powered income streams
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10"
      >
        <Card className="bg-gray-800/50 border-purple-500/20 p-6 hover:bg-gray-800/70 transition-all backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <Brain className="text-purple-400" size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">AI-Powered Mapping</h3>
          <p className="text-gray-300 text-sm">Smart algorithms identify your unique skill combinations</p>
        </Card>
        <Card className="bg-gray-800/50 border-purple-500/20 p-6 hover:bg-gray-800/70 transition-all backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <Target className="text-purple-400" size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">Portfolio Strategy</h3>
          <p className="text-gray-300 text-sm">Build resilient income streams across multiple sectors</p>
        </Card>
        <Card className="bg-gray-800/50 border-purple-500/20 p-6 hover:bg-gray-800/70 transition-all backdrop-blur-sm">
          <div className="flex justify-center mb-3">
            <Zap className="text-purple-400" size={32} />
          </div>
          <h3 className="text-white font-semibold mb-2">Instant Action Plan</h3>
          <p className="text-gray-300 text-sm">Get your personalized roadmap in just 7 minutes</p>
        </Card>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10"
      >
        <Button 
          onClick={handleStart}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg rounded-full shadow-lg shadow-purple-500/25"
        >
          Start Your Path-Finding Journey
          <ArrowRight className="ml-2" size={20} />
        </Button>
      </motion.div>

      <p className="text-gray-400 text-sm relative z-10">
        ⏱️ Takes ~7 minutes • 🔒 Your data stays private • ✨ Instant results
      </p>
    </motion.div>
  );

  const renderConversation = () => (
    <div className="max-w-2xl mx-auto ml-80"> {/* Add left margin for sidebar */}
      <AnimatePresence mode="wait">
        {session.currentStep === 1 && (
          <ConversationStep
            key="step1"
            title="Let's start with your name 🌱"
            subtitle="What should we call you on this journey?"
            placeholder="Enter your first name..."
            value={inputValue}
            onChange={setInputValue}
            onNext={handleNext}
            canProceed={inputValue.trim().length > 0}
          />
        )}
        
        {session.currentStep === 2 && (
          <ConversationStep
            key="step2"
            title={`Hey ${session.name}! Why now? 🤔`}
            subtitle="In 45 seconds or less, tell us what's driving this pivot in your career."
            placeholder="I'm pivoting because..."
            value={inputValue}
            onChange={setInputValue}
            onNext={handleNext}
            canProceed={inputValue.trim().length > 10}
            isTextarea={true}
            hint="Voice input coming soon! For now, just type your thoughts."
          />
        )}
        
        {session.currentStep === 3 && (
          <ConversationStep
            key="step3"
            title="Your Core Skills Inventory 💪"
            subtitle="List 5 things people consistently thank you for or come to you for help with."
            placeholder="e.g., Explaining complex things simply, organizing chaos, finding creative solutions..."
            value={inputValue}
            onChange={setInputValue}
            onNext={handleNext}
            canProceed={inputValue.trim().length > 20}
            isTextarea={true}
            hint="Think beyond job titles - what are your natural talents?"
          />
        )}
        
        {session.currentStep === 4 && (
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
            <p>More steps will be added here...</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0E0E11] to-gray-900 text-white relative overflow-hidden">
      {/* Progress Sidebar - Only show when started */}
      {isStarted && (
        <ProgressSidebar currentStep={session.currentStep} totalSteps={totalSteps} />
      )}

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />

        <motion.div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-indigo-500/6 to-purple-600/6 rounded-full blur-2xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -60, 30, 0],
            scale: [1, 1.3, 0.7, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        />

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Progress Ring - Fixed position */}
      {isStarted && (
        <div className="fixed top-6 right-6 z-50">
          <ProgressRing progress={session.progress} />
        </div>
      )}

      {/* Main Content - Centered with conditional margin */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          {!isStarted ? renderWelcomeScreen() : renderConversation()}
        </div>
      </div>

      {/* Enhanced gradient overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(108, 64, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(143, 108, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(108, 64, 255, 0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>
    </div>
  );
};

export default Index;
