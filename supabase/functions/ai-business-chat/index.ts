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
    
    const { message, sessionId, messageType = 'text', anonymousSessionId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing message with anonymousSessionId:', anonymousSessionId);

    // For anonymous users, we don't require authentication
    let userId = null;
    
    // Try to get user from auth if authorization header exists
    const authorization = req.headers.get('Authorization');
    if (authorization) {
      try {
        const token = authorization.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
        console.log('Authenticated user found:', userId);
      } catch (authError) {
        console.log('No valid auth token, proceeding as anonymous user');
      }
    }

    // Get or create conversation session (supports anonymous users)
    let session;
    if (sessionId) {
      const query = supabase
        .from('conversation_sessions')
        .select('*')
        .eq('id', sessionId);
      
      if (userId) {
        query.eq('user_id', userId);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        console.error('Error fetching session:', error);
        // Create new session if not found
        const { data: newSession, error: createError } = await supabase
          .from('conversation_sessions')
          .insert({
            user_id: userId,
            title: 'AI Business Strategy Session',
            session_type: 'idea_analysis',
            status: 'active'
          })
          .select()
          .single();
        
        if (createError) {
          throw new Error('Failed to create conversation session');
        }
        session = newSession;
      } else {
        session = data;
      }
    } else {
      // Create new session
      const { data, error } = await supabase
        .from('conversation_sessions')
        .insert({
          user_id: userId,
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

    // Get user profile and business context (only if authenticated)
    let profile = null;
    let businessContext = [];
    
    if (userId) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profile = profileData;

      const { data: contextData } = await supabase
        .from('user_business_context')
        .select('*')
        .eq('user_id', userId);
      businessContext = contextData || [];
    }

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
` : 'New visitor (anonymous)';

    // System prompt for AI Business Strategist (optimized for lead capture)
    const systemPrompt = `You are an AI Business Strategist, a world-class consultant specializing in transforming ideas into actionable AI tool implementations. Your role is to help users identify opportunities, create strategic frameworks, and develop practical implementation plans.

PERSONALITY & APPROACH:
- Consultative and insightful, like a top-tier McKinsey consultant
- Ask probing questions to uncover root challenges and opportunities
- Provide immediate value through insights and frameworks
- Guide conversations toward actionable next steps
- Naturally qualify leads for services without being pushy
- Focus on understanding their business challenges deeply

CURRENT USER CONTEXT:
${userProfile}

BUSINESS CONTEXT:
${contextInfo}

CONVERSATION OBJECTIVES (CRITICAL FOR LEAD CAPTURE):
1. Understand their specific business challenge or opportunity
2. Identify AI/automation potential in their situation
3. Provide immediate strategic insights and frameworks
4. Qualify their readiness for implementation (budget, timeline, authority)
5. Capture contact information naturally during conversation
6. Guide toward consultation if they're a qualified prospect

QUALIFICATION CRITERIA (assess and capture during conversation):
- Pain Point Severity: How critical is their challenge? (1-10)
- Budget Readiness: Do they have resources for implementation?
- Timeline Urgency: When do they need results?
- Authority Level: Are they a decision maker?
- Contact Information: Email, company name, phone
- Implementation Readiness: Do they have the capacity to execute?

LEAD CAPTURE STRATEGY:
- Ask for email naturally (for sending resources, follow-up materials)
- Inquire about company name and role
- Understand their decision-making authority
- Probe budget ranges without being direct
- Assess timeline and urgency
- Identify specific pain points and their business impact

CONVERSATION STYLE:
- Ask open-ended, consultative questions
- Provide specific insights based on their industry/context
- Use frameworks and strategic thinking
- Share mini case studies or examples when relevant
- Gradually uncover budget, timeline, and decision-making authority
- Offer immediate value through actionable recommendations
- Request contact info for sharing resources or follow-up

Always end responses with a thoughtful follow-up question that deepens the conversation and uncovers more qualifying information. Prioritize capturing email addresses and understanding their business context.`;

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

    // Store user message (supports anonymous users)
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: userId,
        role: 'user',
        content: message,
        message_type: messageType,
        processing_time_ms: processingTime
      });

    // Store AI response (supports anonymous users)
    await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
        message_type: 'text',
        tokens_used: data.usage?.total_tokens,
        processing_time_ms: processingTime
      });

    // Store AI conversation record (supports anonymous users)
    await supabase
      .from('ai_conversations')
      .insert({
        session_id: session.id,
        user_id: userId,
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

    // Log engagement analytics (supports anonymous users)
    await supabase
      .from('engagement_analytics')
      .insert({
        user_id: userId,
        session_id: session.id,
        anonymous_session_id: anonymousSessionId,
        event_type: 'message_sent',
        event_data: {
          message_length: message.length,
          response_length: aiResponse.length,
          processing_time_ms: processingTime
        }
      });

    // Enhanced lead qualification analysis for anonymous users
    await analyzeForLeadQualification(supabase, message, aiResponse, session.id, userId, anonymousSessionId);

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

// Enhanced lead qualification analysis function
async function analyzeForLeadQualification(
  supabase: any, 
  userMessage: string, 
  aiResponse: string, 
  sessionId: string, 
  userId: string | null, 
  anonymousSessionId?: string
) {
  try {
    const message = userMessage.toLowerCase();
    
    // Enhanced qualification criteria
    const qualifyingIndicators = {
      email: userMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/),
      company: message.match(/\b(company|business|startup|enterprise|llc|inc|corp|firm|organization)\b/i),
      budget: message.match(/\$[\d,]+|budget|invest|spend|cost|expensive|price|funding|revenue/i),
      timeline: message.match(/\b(urgent|asap|this month|next month|soon|immediate|quickly|deadline)\b/i),
      painPoints: message.match(/\b(problem|issue|challenge|difficult|struggle|bottleneck|frustrat|inefficient|manual|time-consuming)\b/i),
      employees: message.match(/\b(\d+)\s*(employee|person|people|staff|team|worker|hire)/i),
      decision: message.match(/\b(decide|decision|approve|authorize|ceo|founder|owner|director|manager|vp|president)\b/i),
      industry: message.match(/\b(healthcare|finance|tech|retail|manufacturing|education|legal|real estate|consulting)\b/i),
      urgency: message.match(/\b(losing money|competitive|behind|struggling|desperate|need help|critical)\b/i)
    };

    // Calculate qualification scores
    let leadScore = 0;
    let painPointSeverity = 1;
    let urgencyLevel = 1;
    let authorityLevel = 1;

    // Email is the most valuable indicator
    if (qualifyingIndicators.email) {
      leadScore += 30;
      console.log('Email detected:', qualifyingIndicators.email[0]);
    }
    
    if (qualifyingIndicators.company) leadScore += 20;
    if (qualifyingIndicators.budget) leadScore += 25;
    if (qualifyingIndicators.timeline) {
      leadScore += 15;
      urgencyLevel = 7;
    }
    if (qualifyingIndicators.painPoints) {
      leadScore += 15;
      painPointSeverity = 6;
    }
    if (qualifyingIndicators.employees) {
      leadScore += 10;
      authorityLevel = 5;
    }
    if (qualifyingIndicators.decision) {
      leadScore += 20;
      authorityLevel = 8;
    }
    if (qualifyingIndicators.industry) leadScore += 10;
    if (qualifyingIndicators.urgency) {
      leadScore += 15;
      urgencyLevel = 9;
      painPointSeverity = 8;
    }

    // If this looks like a qualified lead, store the data
    if (leadScore >= 25) { // Lower threshold for capturing more leads
      console.log(`Lead qualification triggered with score: ${leadScore}/100`);
      
      // Extract contact information
      const email = qualifyingIndicators.email ? qualifyingIndicators.email[0] : null;
      const companyMatch = qualifyingIndicators.company;
      
      // Store lead qualification data
      const qualificationData = {
        user_id: userId,
        session_id: sessionId,
        anonymous_session_id: anonymousSessionId,
        qualification_criteria: {
          indicators: qualifyingIndicators,
          conversation_snippet: userMessage.substring(0, 500),
          email_captured: !!email,
          company_mentioned: !!companyMatch
        },
        pain_point_severity: painPointSeverity,
        budget_qualified: !!qualifyingIndicators.budget,
        timeline_qualified: !!qualifyingIndicators.timeline,
        authority_level: authorityLevel,
        need_urgency: urgencyLevel,
        fit_score: Math.min(leadScore / 100, 1.0),
        conversion_probability: Math.min(leadScore / 100, 0.95),
        recommended_service: leadScore > 60 ? 'Premium AI Strategy Consultation' : 'Basic AI Assessment',
        next_action: leadScore > 60 ? 'Schedule discovery call' : 'Continue nurturing conversation',
        notes: `Auto-generated from conversation. Lead score: ${leadScore}/100. Email: ${email || 'Not captured'}`,
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const { error: qualError } = await supabase
        .from('lead_qualification_data')
        .insert(qualificationData);
      
      if (qualError) {
        console.error('Error storing lead qualification:', qualError);
      } else {
        console.log('Lead qualification data stored successfully');
      }

      // Store business context for anonymous users
      if (email || companyMatch || qualifyingIndicators.industry) {
        const contextEntries = [];
        
        if (email) {
          contextEntries.push({
            user_id: userId,
            anonymous_session_id: anonymousSessionId,
            context_type: 'contact',
            context_key: 'email',
            context_value: email,
            confidence_score: 1.0,
            source: 'conversation'
          });
        }
        
        if (qualifyingIndicators.industry) {
          contextEntries.push({
            user_id: userId,
            anonymous_session_id: anonymousSessionId,
            context_type: 'business',
            context_key: 'industry',
            context_value: qualifyingIndicators.industry[0],
            confidence_score: 0.8,
            source: 'conversation'
          });
        }
        
        if (qualifyingIndicators.employees) {
          const employeeCount = parseInt(qualifyingIndicators.employees[1]);
          let companySize = 'small';
          if (employeeCount >= 50) companySize = 'medium';
          if (employeeCount >= 200) companySize = 'large';
          
          contextEntries.push({
            user_id: userId,
            anonymous_session_id: anonymousSessionId,
            context_type: 'business',
            context_key: 'company_size',
            context_value: companySize,
            confidence_score: 0.9,
            source: 'conversation'
          });
        }

        if (contextEntries.length > 0) {
          const { error: contextError } = await supabase
            .from('user_business_context')
            .insert(contextEntries);
          
          if (contextError) {
            console.error('Error storing business context:', contextError);
          } else {
            console.log('Business context stored for anonymous user');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in lead qualification analysis:', error);
  }
}