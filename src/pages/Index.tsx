import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Brain } from 'lucide-react';
import { getOrCreateAnonymousSession } from '@/utils/anonymousSession';

import WelcomeScreen from '@/components/WelcomeScreen';
import StructuredQuestionnaire from '@/components/StructuredQuestionnaire';
import BlueprintResults from '@/components/BlueprintResults';

const Index = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('chat');
  const [anonymousSessionId, setAnonymousSessionId] = useState<string>('');
  
  // Welcome screen state
  const [showWelcome, setShowWelcome] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [blueprintData, setBlueprintData] = useState<any>(null);

  useEffect(() => {
    // Initialize anonymous session
    const sessionId = getOrCreateAnonymousSession();
    setAnonymousSessionId(sessionId);
  }, []);

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewConversation = () => {
    setCurrentSessionId(undefined);
    setActiveTab('chat');
  };

  const handleWelcomeStart = async () => {
    if (!userName.trim() || !userEmail.trim() || !projectInput.trim()) return;
    
    setIsGenerating(true);
    
    // Store user data for the questionnaire
    setUserName(userName);
    setUserEmail(userEmail);
    setProjectInput(projectInput);
    
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
    setUserName('');
    setUserEmail('');
    setProjectInput('');
    setQuestionnaireData(null);
    setBlueprintData(null);
  };


  return (
    <div className="min-h-screen bg-background">
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
              userName={userName}
              setUserName={setUserName}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
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
              anonymousSessionId={anonymousSessionId}
              initialData={{
                userName,
                userEmail,
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
            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-[calc(100vh-100px)]"
              >
                <Card className="h-full shadow-xl border-2">
                  <CardContent className="p-0 h-full">
                    <Tabs value={activeTab} className="h-full flex flex-col">
                      <TabsContent value="blueprint" className="flex-1 m-0">
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">AI Blueprint Generation</h2>
                            <p className="text-muted-foreground">
                              Your personalized AI strategy blueprint will appear here based on your questionnaire responses.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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