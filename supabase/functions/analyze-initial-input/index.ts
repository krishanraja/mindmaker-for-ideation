import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseOpenAIResponse(content: string): any {
  try {
    // Remove markdown code block formatting if present
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    console.error('Raw content:', content);
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

    // Analyze the initial input to extract business context
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        max_completion_tokens: 1000
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const analysis = parseOpenAIResponse(analysisData.choices[0].message.content);

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