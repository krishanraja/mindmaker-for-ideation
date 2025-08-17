import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, MessageCircle, BarChart3, History, LogOut, UserCircle, Target } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';

import ChatInterface from '@/components/ChatInterface';
import BusinessInsights from '@/components/BusinessInsights';
import ConversationHistory from '@/components/ConversationHistory';
import LeadQualificationDashboard from '@/components/LeadQualificationDashboard';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('chat');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session && event !== 'INITIAL_SESSION') {
          navigate('/auth');
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    
    // Log session start analytics
    if (user) {
      supabase
        .from('engagement_analytics')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          event_type: 'session_start',
          event_data: { tab: activeTab },
          page_url: window.location.href,
          user_agent: navigator.userAgent
        })
        .then(({ error }) => {
          if (error) console.error('Error logging session start:', error);
        });
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setActiveTab('chat');
  };

  const handleNewConversation = () => {
    setCurrentSessionId(undefined);
    setActiveTab('chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your AI business strategist...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/1a44052c-3861-4484-ab2d-b5b970c1f7c1.png" 
                alt="AI Business Strategist" 
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Business Strategist</h1>
                <p className="text-sm text-muted-foreground">Transform your ideas into AI solutions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
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
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      AI Chat
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Business Insights
                    </TabsTrigger>
                    <TabsTrigger value="qualification" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Lead Qualification
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 min-h-0">
                  <TabsContent value="chat" className="h-full m-0 p-0">
                    <ChatInterface 
                      sessionId={currentSessionId}
                      onSessionCreated={handleSessionCreated}
                    />
                  </TabsContent>

                  <TabsContent value="insights" className="h-full m-0 p-6 overflow-auto">
                    <BusinessInsights />
                  </TabsContent>

                  <TabsContent value="qualification" className="h-full m-0 p-6 overflow-auto">
                    <LeadQualificationDashboard />
                  </TabsContent>

                  <TabsContent value="history" className="h-full m-0 p-6">
                    <ConversationHistory 
                      onSessionSelect={handleSessionSelect}
                      onNewConversation={handleNewConversation}
                      currentSessionId={currentSessionId}
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