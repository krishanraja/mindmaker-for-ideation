import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

import WelcomeScreen from '@/components/WelcomeScreen';
import StructuredQuestionnaire from '@/components/StructuredQuestionnaire';
import BlueprintResults from '@/components/BlueprintResults';
import { MainNav } from '@/components/MainNav';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { profile } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [projectInput, setProjectInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [blueprintData, setBlueprintData] = useState<any>(null);

  const handleWelcomeStart = async () => {
    if (!projectInput.trim()) return;
    
    setIsGenerating(true);
    setShowWelcome(false);
    setShowQuestionnaire(true);
    setIsGenerating(false);
  };

  const handleQuestionnaireComplete = (data: any) => {
    setQuestionnaireData(data);
    setBlueprintData(data);
    setShowQuestionnaire(false);
    setShowResults(true);
  };

  const handleStartOver = () => {
    setShowWelcome(true);
    setShowQuestionnaire(false);
    setShowResults(false);
    setProjectInput('');
    setQuestionnaireData(null);
    setBlueprintData(null);
  };


  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WelcomeScreen
              projectInput={projectInput}
              setProjectInput={setProjectInput}
              onStart={handleWelcomeStart}
              isGenerating={isGenerating}
            />
          </motion.div>
        ) : showQuestionnaire ? (
          <motion.div
            key="questionnaire"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <StructuredQuestionnaire
              onComplete={handleQuestionnaireComplete}
              initialData={{
                userName: profile?.display_name || profile?.username || '',
                userEmail: profile?.email || '',
                projectInput
              }}
            />
          </motion.div>
        ) : showResults && blueprintData ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BlueprintResults
              data={blueprintData}
              onStartOver={handleStartOver}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5"
          >
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-[calc(100vh-100px)]"
              >
                <Card className="h-full shadow-xl border-2">
                  <CardContent className="p-0 h-full">
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">AI Blueprint Generation</h2>
                        <p className="text-muted-foreground">
                          Your personalized AI strategy blueprint will appear here based on your questionnaire responses.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;