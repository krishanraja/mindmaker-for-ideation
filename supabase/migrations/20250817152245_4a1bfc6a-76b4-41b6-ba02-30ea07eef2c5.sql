-- Create user profiles table with business context
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  business_type TEXT,
  company_size TEXT,
  industry TEXT,
  pain_points TEXT[],
  goals TEXT[],
  budget_range TEXT,
  timeline TEXT,
  lead_score INTEGER DEFAULT 0,
  qualification_status TEXT DEFAULT 'unqualified' CHECK (qualification_status IN ('unqualified', 'lead', 'qualified', 'hot')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation sessions table
CREATE TABLE public.conversation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  session_type TEXT DEFAULT 'idea_analysis' CHECK (session_type IN ('idea_analysis', 'strategy', 'consultation')),
  total_messages INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  lead_qualified BOOLEAN DEFAULT false,
  summary TEXT,
  key_insights TEXT[],
  next_steps TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'insight', 'suggestion', 'qualification')),
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI conversations tracking table
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  ai_model TEXT DEFAULT 'gpt-4o',
  tokens_used INTEGER,
  response_time_ms INTEGER,
  quality_score INTEGER,
  led_to_qualification BOOLEAN DEFAULT false,
  insights_generated TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user business context table
CREATE TABLE public.user_business_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL CHECK (context_type IN ('industry', 'challenge', 'goal', 'resource', 'timeline', 'budget')),
  context_key TEXT NOT NULL,
  context_value TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  source TEXT DEFAULT 'conversation' CHECK (source IN ('conversation', 'profile', 'inferred')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, context_type, context_key)
);

-- Create lead qualification data table
CREATE TABLE public.lead_qualification_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  qualification_criteria JSONB NOT NULL DEFAULT '{}',
  pain_point_severity INTEGER CHECK (pain_point_severity >= 1 AND pain_point_severity <= 10),
  budget_qualified BOOLEAN DEFAULT false,
  timeline_qualified BOOLEAN DEFAULT false,
  authority_level INTEGER CHECK (authority_level >= 1 AND authority_level <= 5),
  need_urgency INTEGER CHECK (need_urgency >= 1 AND need_urgency <= 10),
  fit_score REAL DEFAULT 0 CHECK (fit_score >= 0 AND fit_score <= 1),
  conversion_probability REAL DEFAULT 0 CHECK (conversion_probability >= 0 AND conversion_probability <= 1),
  recommended_service TEXT,
  next_action TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create engagement analytics table
CREATE TABLE public.engagement_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('session_start', 'message_sent', 'insight_viewed', 'qualification_achieved', 'booking_initiated', 'session_end')),
  event_data JSONB DEFAULT '{}',
  engagement_duration_seconds INTEGER,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security audit log table
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_business_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_qualification_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for conversation_sessions
CREATE POLICY "Users can view their own sessions" ON public.conversation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.conversation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.conversation_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for ai_conversations
CREATE POLICY "Users can view their own AI conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_business_context
CREATE POLICY "Users can view their own context" ON public.user_business_context FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own context" ON public.user_business_context FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own context" ON public.user_business_context FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for lead_qualification_data
CREATE POLICY "Users can view their own qualification data" ON public.lead_qualification_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own qualification data" ON public.lead_qualification_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own qualification data" ON public.lead_qualification_data FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for engagement_analytics
CREATE POLICY "Users can view their own analytics" ON public.engagement_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analytics" ON public.engagement_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for security_audit_log (admin only for viewing, system for inserting)
CREATE POLICY "System can insert audit logs" ON public.security_audit_log FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON public.conversation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_business_context_updated_at
  BEFORE UPDATE ON public.user_business_context
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_qualification_data_updated_at
  BEFORE UPDATE ON public.lead_qualification_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Log the user creation
  INSERT INTO public.security_audit_log (user_id, action, resource, details, success)
  VALUES (NEW.id, 'user_created', 'auth.users', jsonb_build_object('email', NEW.email), true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_conversation_sessions_user_id ON public.conversation_sessions(user_id);
CREATE INDEX idx_conversation_sessions_status ON public.conversation_sessions(status);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_ai_conversations_session_id ON public.ai_conversations(session_id);
CREATE INDEX idx_user_business_context_user_id ON public.user_business_context(user_id);
CREATE INDEX idx_user_business_context_type ON public.user_business_context(context_type);
CREATE INDEX idx_lead_qualification_user_id ON public.lead_qualification_data(user_id);
CREATE INDEX idx_engagement_analytics_user_id ON public.engagement_analytics(user_id);
CREATE INDEX idx_engagement_analytics_event_type ON public.engagement_analytics(event_type);
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at);