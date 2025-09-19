import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Brain } from 'lucide-react';
import { getOrCreateAnonymousSession } from '@/utils/anonymousSession';

import ChatInterface from '@/components/ChatInterface';
import WelcomeScreen from '@/components/WelcomeScreen';

const Index = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('chat');
  const [anonymousSessionId, setAnonymousSessionId] = useState<string>('');
  
  // Welcome screen state
  const [showWelcome, setShowWelcome] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string>('');

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
    if (!userName.trim() || !userEmail.trim() || !userInput.trim()) return;
    
    setIsGenerating(true);
    
    // Store user data in session storage for lead capture
    sessionStorage.setItem('user_name', userName);
    sessionStorage.setItem('user_email', userEmail);
    sessionStorage.setItem('initial_input', userInput);
    
    // Set the initial message for the chat
    setInitialMessage(userInput);
    
    // Transition to chat interface
    setTimeout(() => {
      setIsGenerating(false);
      setShowWelcome(false);
    }, 1000);
  };


  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <WelcomeScreen
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userInput={userInput}
            setUserInput={setUserInput}
            onStart={handleWelcomeStart}
            isGenerating={isGenerating}
          />
        </motion.div>
      ) : (
        <motion.div 
          key="chat"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
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
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="h-full flex flex-col"
                  >
                    <div className="border-b px-6 py-4">
                      <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="chat" className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          AI Business Consultation
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 min-h-0">
                      <TabsContent value="chat" className="h-full m-0 p-0">
                        <ChatInterface 
                          sessionId={currentSessionId}
                          onSessionCreated={handleSessionCreated}
                          anonymousSessionId={anonymousSessionId}
                          initialMessage={initialMessage}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;