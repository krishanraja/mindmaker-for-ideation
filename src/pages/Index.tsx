
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

  const totalSteps = 10;

  const handleStart = () => {
    setIsStarted(true);
    setSession(prev => ({ ...prev, currentStep: 1, progress: 10 }));
  };

  const handleNext = () => {
    if (session.currentStep === 1 && inputValue.trim()) {
      setSession(prev => ({ 
        ...prev, 
        name: inputValue,
        currentStep: 2,
        progress: 20
      }));
      setInputValue('');
    } else if (session.currentStep === 2 && inputValue.trim()) {
      setSession(prev => ({ 
        ...prev, 
        whyNow: inputValue,
        currentStep: 3,
        progress: 30
      }));
      setInputValue('');
    }
  };

  const renderWelcomeScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8"
    >
      <div className="relative">
        <NeuronLoop />
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="relative z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Fractionl Portfolio
            <br />
            Path-Finder
          </h1>
          <p className="text-xl text-purple-200 mb-2">
            Turn your hidden super-powers into
          </p>
          <p className="text-2xl font-semibold text-white mb-8">
            agent-powered income streams 🚀
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800/50 border-purple-500/20 p-6 hover:bg-gray-800/70 transition-all">
          <Brain className="text-purple-400 mb-3" size={32} />
          <h3 className="text-white font-semibold mb-2">AI-Powered Mapping</h3>
          <p className="text-gray-300 text-sm">Smart algorithms identify your unique skill combinations</p>
        </Card>
        <Card className="bg-gray-800/50 border-purple-500/20 p-6 hover:bg-gray-800/70 transition-all">
          <Target className="text-purple-400 mb-3" size={32} />
          <h3 className="text-white font-semibold mb-2">Portfolio Strategy</h3>
          <p className="text-gray-300 text-sm">Build resilient income streams across multiple sectors</p>
        </Card>
        <Card className="bg-gray-800/50 border-purple-500/20 p-6 hover:bg-gray-800/70 transition-all">
          <Zap className="text-purple-400 mb-3" size={32} />
          <h3 className="text-white font-semibold mb-2">Instant Action Plan</h3>
          <p className="text-gray-300 text-sm">Get your personalized roadmap in just 7 minutes</p>
        </Card>
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
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

      <p className="text-gray-400 text-sm">
        ⏱️ Takes ~7 minutes • 🔒 Your data stays private • ✨ Instant results
      </p>
    </motion.div>
  );

  const renderConversation = () => (
    <div className="max-w-2xl mx-auto">
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
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0E0E11] to-gray-900 text-white">
      {/* Progress Ring - Fixed position */}
      {isStarted && (
        <div className="fixed top-6 right-6 z-50">
          <ProgressRing progress={session.progress} />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-16">
        {!isStarted ? renderWelcomeScreen() : renderConversation()}
      </div>

      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #6C40FF 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8F6CFF 0%, transparent 50%)`
        }} />
      </div>
    </div>
  );
};

export default Index;
