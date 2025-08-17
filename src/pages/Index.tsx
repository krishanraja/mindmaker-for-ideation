import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, MessageCircle, BarChart3, History, LogOut, UserCircle } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';

import ChatInterface from '@/components/ChatInterface';
import BusinessInsights from '@/components/BusinessInsights';

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
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      AI Chat
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Business Insights
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Conversation History
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

                  <TabsContent value="history" className="h-full m-0 p-6">
                    <ConversationHistory 
                      userId={user.id}
                      onSessionSelect={(sessionId) => {
                        setCurrentSessionId(sessionId);
                        setActiveTab('chat');
                      }}
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

// Simple conversation history component
const ConversationHistory: React.FC<{
  userId: string;
  onSessionSelect: (sessionId: string) => void;
}> = ({ userId, onSessionSelect }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
        <p className="text-muted-foreground">Start a conversation in the AI Chat tab to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Conversations</h3>
        <p className="text-sm text-muted-foreground">{sessions.length} sessions</p>
      </div>
      
      <div className="space-y-3">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSessionSelect(session.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{session.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {session.lead_qualified && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                    <span className="text-xs text-muted-foreground capitalize">
                      {session.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{session.total_messages || 0} messages</span>
                  <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                </div>
                {session.summary && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {session.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Index;