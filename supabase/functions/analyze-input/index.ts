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

    const { input } = await req.json();

    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing input:', input);

    // Perform semantic analysis
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an expert semantic analyst. Analyze the user's input and provide a comprehensive JSON analysis. Be extremely thorough and intelligent. If the input is nonsense or gibberish, say so clearly in the analysis.
            
            Return JSON with: primaryDomains, intentMapping, complexityAssessment, contextualFactors, technicalRequirements, userPersona, missingInformation, confidenceScore.`
          },
          {
            role: "user",
            content: input
          }
        ],
        temperature: 0.3,
      }),
    });

    const analysisData = await analysisResponse.json();
    console.log('OpenAI Analysis Response:', analysisData);

    if (analysisData.error) {
      console.error('OpenAI API Error:', analysisData.error);
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${analysisData.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!analysisData.choices || !analysisData.choices[0] || !analysisData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', analysisData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysis = JSON.parse(analysisData.choices[0].message.content || "{}");

    // Build user profile
    const profileResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Create a detailed user profile JSON with: expertiseLevel, domain, constraints, goals, previousResponses. Be specific and avoid generic responses.`
          },
          {
            role: "user",
            content: `Input: ${input}\nAnalysis: ${JSON.stringify(analysis)}`
          }
        ],
        temperature: 0.2,
      }),
    });

    const profileData = await profileResponse.json();
    console.log('OpenAI Profile Response:', profileData);

    if (profileData.error) {
      console.error('OpenAI API Error in profile generation:', profileData.error);
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${profileData.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profileData.choices || !profileData.choices[0] || !profileData.choices[0].message) {
      console.error('Invalid OpenAI profile response structure:', profileData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userProfile = JSON.parse(profileData.choices[0].message.content || "{}");

    // Generate AI questions
    const questionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Generate 3-4 highly intelligent, contextual questions that show you understand their specific context, not generic template questions. Return JSON array with question, rationale, type, priority.`
          },
          {
            role: "user",
            content: `Original input: ${input}\n\nSemantic analysis: ${JSON.stringify(analysis)}\n\nUser profile: ${JSON.stringify(userProfile)}`
          }
        ],
        temperature: 0.4,
      }),
    });

    const questionsData = await questionsResponse.json();
    console.log('OpenAI Questions Response:', questionsData);

    if (questionsData.error) {
      console.error('OpenAI API Error in questions generation:', questionsData.error);
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${questionsData.error.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!questionsData.choices || !questionsData.choices[0] || !questionsData.choices[0].message) {
      console.error('Invalid OpenAI questions response structure:', questionsData);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const questions = JSON.parse(questionsData.choices[0].message.content || "[]");

    console.log('Analysis complete');

    return new Response(JSON.stringify({ 
      analysis,
      userProfile,
      questions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-input function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});