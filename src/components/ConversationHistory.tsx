import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Star, 
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ConversationSession {
  id: string;
  title: string;
  status: string;
  session_type: string;
  total_messages: number;
  engagement_score: number;
  lead_qualified: boolean;
  created_at: string;
  updated_at: string;
  summary?: string;
  key_insights?: string[];
}

interface ConversationHistoryProps {
  onSessionSelect: (sessionId: string) => void;
  onNewConversation: () => void;
  currentSessionId?: string;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSessionSelect,
  onNewConversation,
  currentSessionId
}) => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Error loading conversation history:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string, leadQualified: boolean) => {
    if (leadQualified) return 'bg-green-500/10 text-green-500 border-green-500/20';
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'idea_analysis': return <TrendingUp className="h-4 w-4" />;
      case 'business_consultation': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conversation History</h3>
        <Button 
          onClick={onNewConversation}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentSessionId === session.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => onSessionSelect(session.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSessionTypeIcon(session.session_type)}
                        <h4 className="font-medium text-sm truncate max-w-[150px]">
                          {session.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.lead_qualified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(session.status, session.lead_qualified)}
                        >
                          {session.lead_qualified ? 'Qualified' : session.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {session.total_messages} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {session.engagement_score}/100
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.updated_at)}
                      </span>
                    </div>

                    {session.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.summary}
                      </p>
                    )}

                    {session.key_insights && session.key_insights.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {session.key_insights.slice(0, 2).map((insight, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {insight}
                          </Badge>
                        ))}
                        {session.key_insights.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{session.key_insights.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {sessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No conversations yet</p>
              <Button onClick={onNewConversation} variant="outline">
                Start Your First Conversation
              </Button>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationHistory;