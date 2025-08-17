import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Brain } from 'lucide-react';
import { getOrCreateAnonymousSession } from '@/utils/anonymousSession';

import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('chat');
  const [anonymousSessionId, setAnonymousSessionId] = useState<string>('');

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/1a44052c-3861-4484-ab2d-b5b970c1f7c1.png" 
                alt="AI Business Strategist" 
                className="h-8 w-8"
              />
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">AI Business Strategist</h1>
                <p className="text-sm text-muted-foreground">Transform your ideas into AI solutions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-[calc(100vh-200px)]"
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
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;