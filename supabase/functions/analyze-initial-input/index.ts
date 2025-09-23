import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseOpenAIResponse(content: string): any {
  try {
    // Log the raw content for debugging
    console.log('Raw OpenAI content received:', JSON.stringify(content));
    
    if (!content || content.trim() === '') {
      console.error('Empty content received from OpenAI API');
      throw new Error('Empty response from OpenAI API');
    }
    
    // Remove markdown code block formatting if present
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log('Cleaned content for parsing:', JSON.stringify(cleanContent));
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw content:', content);
    console.error('Content type:', typeof content);
    console.error('Content length:', content?.length || 0);
    throw new Error('Failed to parse AI response');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { input, userName } = await req.json();
    
    if (!input) {
      throw new Error('Input is required');
    }

    console.log('Analyzing initial input:', { input, userName });

    // Try GPT-5 first, fallback to GPT-4o if it fails
    let analysisResponse;
    let requestBody;
    
    try {
      // First attempt with GPT-5 using max_tokens instead of max_completion_tokens
      requestBody = {
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are Krish's AI clone, an expert business strategist and product consultant. Analyze the user's initial input to extract comprehensive business context.

Extract and infer:
1. Industry/Domain (be specific - not just "tech" but "event management", "healthcare", "fintech", etc.)
2. Target audience (who will use this product)
3. Core problem being solved
4. Business model implications
5. Technical complexity level needed
6. User's role/perspective (founder, employee, consultant, etc.)
7. Urgency/timeline indicators
8. Scale/ambition level
9. Key missing information that would be critical for product success

Return as JSON with these exact keys:
{
  "industry": "specific industry",
  "targetAudience": "who will use this",
  "coreProblem": "main problem being solved",
  "businessModel": "revenue/business model implications",
  "technicalComplexity": "low/medium/high",
  "userRole": "their role/perspective",
  "urgency": "timeline/urgency level",
  "ambitionLevel": "small tool/startup/enterprise solution",
  "missingCriticalInfo": ["info1", "info2", "info3"],
  "keyInsights": ["insight1", "insight2", "insight3"]
}`
          },
          {
            role: 'user',
            content: `User: ${userName || 'Anonymous'}\nProject idea: ${input}`
          }
        ],
        max_tokens: 1000
      };
      
      console.log('Attempting GPT-5 with request:', JSON.stringify(requestBody));
      
      analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('GPT-5 Response status:', analysisResponse.status);
      
      if (!analysisResponse.ok) {
        throw new Error(`GPT-5 failed with status ${analysisResponse.status}`);
      }
    } catch (gpt5Error) {
      console.warn('GPT-5 failed, falling back to GPT-4o:', gpt5Error);
      
      // Fallback to GPT-4o
      requestBody = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are Krish's AI clone, an expert business strategist and product consultant. Analyze the user's initial input to extract comprehensive business context.

Extract and infer:
1. Industry/Domain (be specific - not just "tech" but "event management", "healthcare", "fintech", etc.)
2. Target audience (who will use this product)
3. Core problem being solved
4. Business model implications
5. Technical complexity level needed
6. User's role/perspective (founder, employee, consultant, etc.)
7. Urgency/timeline indicators
8. Scale/ambition level
9. Key missing information that would be critical for product success

Return as JSON with these exact keys:
{
  "industry": "specific industry",
  "targetAudience": "who will use this",
  "coreProblem": "main problem being solved",
  "businessModel": "revenue/business model implications",
  "technicalComplexity": "low/medium/high",
  "userRole": "their role/perspective",
  "urgency": "timeline/urgency level",
  "ambitionLevel": "small tool/startup/enterprise solution",
  "missingCriticalInfo": ["info1", "info2", "info3"],
  "keyInsights": ["insight1", "insight2", "insight3"]
}`
          },
          {
            role: 'user',
            content: `User: ${userName || 'Anonymous'}\nProject idea: ${input}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      };
      
      console.log('Attempting GPT-4o fallback with request:', JSON.stringify(requestBody));
      
      analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    }

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI API error:', errorText);
      console.error('Request body that failed:', JSON.stringify(requestBody));
      throw new Error(`OpenAI API error: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('Full OpenAI response:', JSON.stringify(analysisData));
    
    if (!analysisData.choices || !analysisData.choices[0] || !analysisData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', analysisData);
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    const content = analysisData.choices[0].message.content;
    console.log('OpenAI message content:', JSON.stringify(content));
    
    const analysis = parseOpenAIResponse(content);

    console.log('Analysis complete:', analysis);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-initial-input function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to analyze initial input'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});