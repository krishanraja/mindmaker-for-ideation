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
    const { session } = await req.json();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating blueprint for session:', session.sessionId);

    // Generate personalized Lovable prompt
    const promptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Create a highly personalized, detailed Lovable prompt that references specific details from the conversation and shows deep understanding of their goals.`
          },
          {
            role: "user",
            content: `Full conversation:\nOriginal: ${session.originalInput}\nResponses: ${session.userResponses.join('\n')}\nProfile: ${JSON.stringify(session.userProfile)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const promptData = await promptResponse.json();
    const lovablePrompt = promptData.choices[0].message.content || "";

    // Generate intelligent workflows
    const workflowsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Generate a personalized workflow specific to their project, expertise level, and constraints. Return JSON array with title, description, duration, dependencies, deliverables, complexity.`
          },
          {
            role: "user",
            content: `Context: ${session.originalInput}\nResponses: ${session.userResponses.join('\n')}\nProfile: ${JSON.stringify(session.userProfile)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const workflowsData = await workflowsResponse.json();
    const workflows = JSON.parse(workflowsData.choices[0].message.content || "[]");

    // Generate contextual agent suggestions
    const agentsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Suggest AI agents/tools specifically relevant to their project. Only suggest genuinely relevant tools. Return JSON array with name, description, category, relevanceScore, specificUseCase.`
          },
          {
            role: "user",
            content: `Project: ${session.originalInput}\nDetails: ${session.userResponses.join('\n')}\nDomain: ${session.userProfile.domain}`
          }
        ],
        temperature: 0.4,
      }),
    });

    const agentsData = await agentsResponse.json();
    const agentSuggestions = JSON.parse(agentsData.choices[0].message.content || "[]");

    const blueprint = {
      lovablePrompt,
      workflows,
      agentSuggestions
    };

    console.log('Blueprint generated successfully');

    return new Response(JSON.stringify({ blueprint }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-blueprint function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});