import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to parse JSON that might be wrapped in markdown
function parseOpenAIResponse(content: string): any {
  if (!content) return [];
  
  // Remove markdown code blocks if present
  const cleanedContent = content
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  
  try {
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Failed to parse OpenAI response:', { content, cleanedContent, error });
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
            content: `You are an expert Lovable prompt engineer. Create a detailed, actionable Lovable prompt that will help build the exact application the user wants.

The prompt must be:
1. TECHNICAL and SPECIFIC - include exact features, functionality, and technical requirements
2. DESIGN-FOCUSED - include specific UI/UX requirements, color schemes, layouts, and visual design elements gathered from the conversation
3. ACTIONABLE - clear enough that a developer could build the app from this prompt alone
4. PERSONALIZED - reference specific details from their responses and use their name

Structure the prompt with these sections:
- PROJECT OVERVIEW: Brief summary with user's name and vision
- CORE FEATURES: Specific functionality requirements from their responses
- TECHNICAL REQUIREMENTS: Stack, integrations, data models, etc.
- DESIGN SPECIFICATIONS: UI/UX requirements, visual design, layouts, color preferences, styling
- USER EXPERIENCE: Navigation, workflows, interactions
- ADDITIONAL REQUIREMENTS: Any constraints, preferences, or special needs mentioned

Do NOT write this as a conversational message. Write it as a comprehensive development brief that contains everything needed to build the application.`
          },
          {
            role: "user",
            content: `User Name: ${session.userName}\nOriginal Idea: ${session.originalInput}\n\nDetailed Responses:\n${session.userResponses.map((response, index) => `Question ${index + 1}: ${session.questions[index]?.question || 'Unknown question'}\nAnswer: ${response}`).join('\n\n')}\n\nUser Profile: ${JSON.stringify(session.userProfile, null, 2)}`
          }
        ],
        temperature: 0.2,
      }),
    });

    const promptData = await promptResponse.json();
    console.log('OpenAI Prompt Response:', promptData);

    if (promptData.error) {
      console.error('OpenAI API Error in prompt generation:', promptData.error);
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${promptData.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!promptData.choices || !promptData.choices[0] || !promptData.choices[0].message) {
      console.error('Invalid OpenAI prompt response structure:', promptData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    console.log('OpenAI Workflows Response:', workflowsData);

    if (workflowsData.error) {
      console.error('OpenAI API Error in workflows generation:', workflowsData.error);
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${workflowsData.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!workflowsData.choices || !workflowsData.choices[0] || !workflowsData.choices[0].message) {
      console.error('Invalid OpenAI workflows response structure:', workflowsData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workflows = parseOpenAIResponse(workflowsData.choices[0].message.content || "[]");

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
    console.log('OpenAI Agents Response:', agentsData);

    if (agentsData.error) {
      console.error('OpenAI API Error in agents generation:', agentsData.error);
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${agentsData.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!agentsData.choices || !agentsData.choices[0] || !agentsData.choices[0].message) {
      console.error('Invalid OpenAI agents response structure:', agentsData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const agentSuggestions = parseOpenAIResponse(agentsData.choices[0].message.content || "[]");

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