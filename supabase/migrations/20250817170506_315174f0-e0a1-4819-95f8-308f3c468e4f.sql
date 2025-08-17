-- Make user_id nullable in all relevant tables to support anonymous usage
ALTER TABLE public.lead_qualification_data ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.chat_messages ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.conversation_sessions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.ai_conversations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.user_business_context ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.engagement_analytics ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow anonymous access for lead capture
DROP POLICY IF EXISTS "Users can insert their own qualification data" ON public.lead_qualification_data;
DROP POLICY IF EXISTS "Users can view their own qualification data" ON public.lead_qualification_data;
DROP POLICY IF EXISTS "Users can update their own qualification data" ON public.lead_qualification_data;

CREATE POLICY "Allow anonymous lead qualification insert" ON public.lead_qualification_data
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous lead qualification select" ON public.lead_qualification_data
FOR SELECT USING (true);

CREATE POLICY "Allow anonymous lead qualification update" ON public.lead_qualification_data
FOR UPDATE USING (true);

-- Update chat messages policies for anonymous access
DROP POLICY IF EXISTS "Users can create their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;

CREATE POLICY "Allow anonymous chat messages insert" ON public.chat_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous chat messages select" ON public.chat_messages
FOR SELECT USING (true);

-- Update conversation sessions policies for anonymous access
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.conversation_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.conversation_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.conversation_sessions;

CREATE POLICY "Allow anonymous conversation sessions insert" ON public.conversation_sessions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous conversation sessions select" ON public.conversation_sessions
FOR SELECT USING (true);

CREATE POLICY "Allow anonymous conversation sessions update" ON public.conversation_sessions
FOR UPDATE USING (true);

-- Update AI conversations policies for anonymous access
DROP POLICY IF EXISTS "Users can create their own AI conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can view their own AI conversations" ON public.ai_conversations;

CREATE POLICY "Allow anonymous AI conversations insert" ON public.ai_conversations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous AI conversations select" ON public.ai_conversations
FOR SELECT USING (true);

-- Update user business context policies for anonymous access
DROP POLICY IF EXISTS "Users can insert their own context" ON public.user_business_context;
DROP POLICY IF EXISTS "Users can view their own context" ON public.user_business_context;
DROP POLICY IF EXISTS "Users can update their own context" ON public.user_business_context;

CREATE POLICY "Allow anonymous business context insert" ON public.user_business_context
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous business context select" ON public.user_business_context
FOR SELECT USING (true);

CREATE POLICY "Allow anonymous business context update" ON public.user_business_context
FOR UPDATE USING (true);

-- Update engagement analytics policies for anonymous access
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.engagement_analytics;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.engagement_analytics;

CREATE POLICY "Allow anonymous engagement analytics insert" ON public.engagement_analytics
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous engagement analytics select" ON public.engagement_analytics
FOR SELECT USING (true);

-- Add session_id column to tables that don't have it for anonymous session tracking
ALTER TABLE public.lead_qualification_data ADD COLUMN IF NOT EXISTS anonymous_session_id text;
ALTER TABLE public.user_business_context ADD COLUMN IF NOT EXISTS anonymous_session_id text;
ALTER TABLE public.engagement_analytics ADD COLUMN IF NOT EXISTS anonymous_session_id text;