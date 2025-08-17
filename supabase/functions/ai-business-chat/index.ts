import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface BusinessContext {
  industry?: string;
  company_size?: string;
  pain_points?: string[];
  goals?: string[];
  budget_range?: string;
  timeline?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('No authorization header');
    }

    // Verify JWT token
    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { message, sessionId, messageType = 'text' } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing message for user:', user.id);

    // Get or create conversation session
    let session;
    if (sessionId) {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching session:', error);
        throw new Error('Failed to fetch conversation session');
      }
      session = data;
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('conversation_sessions')
        .insert({
          user_id: user.id,
          title: 'AI Business Strategy Session',
          session_type: 'idea_analysis',
          status: 'active'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating session:', error);
        throw new Error('Failed to create conversation session');
      }
      session = data;
    }

    // Get user profile and business context
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: businessContext } = await supabase
      .from('user_business_context')
      .select('*')
      .eq('user_id', user.id);

    // Get recent conversation history
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(20);

    // Build conversation context
    const contextInfo = businessContext?.map(ctx => 
      `${ctx.context_type}: ${ctx.context_key} = ${ctx.context_value}`
    ).join('\n') || '';

    const userProfile = profile ? `
Name: ${profile.name || 'Unknown'}
Industry: ${profile.industry || 'Not specified'}
Company Size: ${profile.company_size || 'Not specified'}
Business Type: ${profile.business_type || 'Not specified'}
Current Goals: ${profile.goals?.join(', ') || 'Not specified'}
Pain Points: ${profile.pain_points?.join(', ') || 'Not specified'}
Budget Range: ${profile.budget_range || 'Not specified'}
Timeline: ${profile.timeline || 'Not specified'}
Lead Score: ${profile.lead_score || 0}
Qualification Status: ${profile.qualification_status || 'unqualified'}
` : '';

    // System prompt for AI Business Strategist
    const systemPrompt = `You are an AI Business Strategist, a world-class consultant specializing in transforming ideas into actionable AI tool implementations. Your role is to help users identify opportunities, create strategic frameworks, and develop practical implementation plans.

PERSONALITY & APPROACH:
- Consultative and insightful, like a top-tier McKinsey consultant
- Ask probing questions to uncover root challenges and opportunities
- Provide immediate value through insights and frameworks
- Guide conversations toward actionable next steps
- Naturally qualify leads for services without being pushy

CURRENT USER CONTEXT:
${userProfile}

BUSINESS CONTEXT:
${contextInfo}

CONVERSATION OBJECTIVES:
1. Understand their specific business challenge or opportunity
2. Identify AI/automation potential in their situation
3. Provide immediate strategic insights and frameworks
4. Qualify their readiness for implementation (budget, timeline, authority)
5. Guide toward consultation if they're a qualified prospect

QUALIFICATION CRITERIA (assess during conversation):
- Pain Point Severity: How critical is their challenge? (1-10)
- Budget Readiness: Do they have resources for implementation?
- Timeline Urgency: When do they need results?
- Authority Level: Are they a decision maker?
- Implementation Readiness: Do they have the capacity to execute?

CONVERSATION STYLE:
- Ask open-ended, consultative questions
- Provide specific insights based on their industry/context
- Use frameworks and strategic thinking
- Share mini case studies or examples when relevant
- Gradually uncover budget, timeline, and decision-making authority
- Offer immediate value through actionable recommendations

Always end responses with a thoughtful follow-up question that deepens the conversation and uncovers more qualifying information.`;

    // Build messages array for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(recentMessages || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with', messages.length, 'messages');

    // Call OpenAI API
    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: messages,
        max_completion_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const processingTime = Date.now() - startTime;

    console.log('OpenAI response received, processing time:', processingTime + 'ms');

    // Store user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user.id,
        role: 'user',
        content: message,
        message_type: messageType,
        processing_time_ms: processingTime
      });

    // Store AI response
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user.id,
        role: 'assistant',
        content: aiResponse,
        message_type: 'text',
        tokens_used: data.usage?.total_tokens,
        processing_time_ms: processingTime
      });

    // Store AI conversation record
    await supabase
      .from('ai_conversations')
      .insert({
        session_id: session.id,
        user_id: user.id,
        question: message,
        response: aiResponse,
        ai_model: 'gpt-5-2025-08-07',
        tokens_used: data.usage?.total_tokens,
        response_time_ms: processingTime
      });

    // Update session stats
    await supabase
      .from('conversation_sessions')
      .update({
        total_messages: (session.total_messages || 0) + 2,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

    // Log engagement analytics
    await supabase
      .from('engagement_analytics')
      .insert({
        user_id: user.id,
        session_id: session.id,
        event_type: 'message_sent',
        event_data: {
          message_length: message.length,
          response_length: aiResponse.length,
          processing_time_ms: processingTime
        }
      });

    // Basic lead qualification analysis
    const lowercaseMessage = message.toLowerCase();
    const budgetKeywords = ['budget', 'cost', 'price', 'investment', 'spend'];
    const urgencyKeywords = ['urgent', 'asap', 'quickly', 'immediately', 'soon'];
    const authorityKeywords = ['decide', 'decision', 'approve', 'budget', 'ceo', 'founder', 'owner'];

    const hasBudgetSignals = budgetKeywords.some(keyword => lowercaseMessage.includes(keyword));
    const hasUrgencySignals = urgencyKeywords.some(keyword => lowercaseMessage.includes(keyword));
    const hasAuthoritySignals = authorityKeywords.some(keyword => lowercaseMessage.includes(keyword));

    if (hasBudgetSignals || hasUrgencySignals || hasAuthoritySignals) {
      // Update lead qualification data
      await supabase
        .from('lead_qualification_data')
        .upsert({
          user_id: user.id,
          session_id: session.id,
          qualification_criteria: {
            has_budget_signals: hasBudgetSignals,
            has_urgency_signals: hasUrgencySignals,
            has_authority_signals: hasAuthoritySignals
          },
          budget_qualified: hasBudgetSignals,
          conversion_probability: (hasBudgetSignals ? 0.3 : 0) + (hasUrgencySignals ? 0.3 : 0) + (hasAuthoritySignals ? 0.2 : 0),
          updated_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      sessionId: session.id,
      processingTime,
      tokensUsed: data.usage?.total_tokens
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-business-chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: 'Please check the server logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});