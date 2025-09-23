import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to parse JSON that might be wrapped in markdown
function parseOpenAIResponse(content: string, type: string): any {
  console.log('Raw OpenAI content received:', JSON.stringify(content));
  
  if (!content || content.trim() === '') {
    console.error('Empty content received from OpenAI API');
    return type === 'should_continue' ? {} : [];
  }
  
  // Remove markdown code blocks if present
  const cleanedContent = content
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  
  console.log('Cleaned content for parsing:', JSON.stringify(cleanedContent));
  
  try {
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Failed to parse OpenAI response:', { content, cleanedContent, error });
    console.error('Content type:', typeof content);
    console.error('Content length:', content?.length || 0);
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}

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

    // Try GPT-4o-mini first with proper parameters
    const requestBody = {
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
      max_tokens: 1000
    };
    
    console.log('Making OpenAI request:', JSON.stringify(requestBody));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Full OpenAI response:', JSON.stringify(data));

    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      console.error('Request body that failed:', JSON.stringify(requestBody));
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${data.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      console.error('Request body that failed:', JSON.stringify(requestBody));
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = data.choices[0].message.content || (type === 'should_continue' ? '{}' : '[]');
    console.log('OpenAI message content:', JSON.stringify(content));
    
    const result = parseOpenAIResponse(content, type);

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