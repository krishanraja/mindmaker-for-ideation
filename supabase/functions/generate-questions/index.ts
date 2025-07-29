import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { session, type = 'followup' } = await req.json();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating questions for session:', session.sessionId);

    let systemContent, userContent;

    if (type === 'should_continue') {
      // Check if more questions are needed
      systemContent = `Analyze the conversation and determine if more clarification is needed. Return JSON with shouldContinue, reason, informationGaps. Only continue if there are genuine, important gaps.`;
      userContent = `Original input: ${session.originalInput}\nUser responses: ${session.userResponses.join('\n')}\nQuestions asked: ${JSON.stringify(session.questions)}`;
    } else {
      // Generate follow-up questions
      systemContent = `Generate intelligent follow-up questions that reference and build on previous responses. Be highly contextual and show understanding. Return JSON array with question, rationale, type, priority.`;
      userContent = `Conversation history:\nOriginal: ${session.originalInput}\nPrevious questions: ${JSON.stringify(session.questions)}\nUser responses: ${session.userResponses.join('\n')}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: "system",
            content: systemContent
          },
          {
            role: "user",
            content: userContent
          }
        ],
        temperature: type === 'should_continue' ? 0.2 : 0.4,
      }),
    });

    const data = await response.json();
    console.log('OpenAI Generate Questions Response:', data);

    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${data.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(data.choices[0].message.content || (type === 'should_continue' ? '{}' : '[]'));

    console.log('Questions generated successfully');

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});