import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseOpenAIResponse(content: string): any {
  try {
    console.log('Raw OpenAI content received:', JSON.stringify(content));
    
    if (!content || content.trim() === '') {
      console.error('Empty content received from OpenAI API');
      throw new Error('Empty response from OpenAI API');
    }
    
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { analysis, conversationHistory, questionIndex } = await req.json();
    
    if (!analysis) {
      throw new Error('Analysis context is required');
    }

    console.log('Generating dynamic question:', { questionIndex, historyLength: conversationHistory?.length });

    const prompt = `You are Krish's AI clone, a world-class business strategist and product consultant. Generate the next thoughtful question for this user based on their business context and conversation history.

BUSINESS CONTEXT:
Industry: ${analysis.industry}
Target Audience: ${analysis.targetAudience}
Core Problem: ${analysis.coreProblem}
User Role: ${analysis.userRole}
Technical Complexity: ${analysis.technicalComplexity}
Missing Critical Info: ${analysis.missingCriticalInfo?.join(', ')}

CONVERSATION HISTORY:
${conversationHistory?.map((item: any, i: number) => `Q${i+1}: ${item.question}\nA${i+1}: ${item.answer}`).join('\n') || 'No previous questions'}

QUESTION #${questionIndex + 1} GUIDELINES:
${questionIndex === 0 ? `
- This is the FIRST question. Show you listened by referencing their specific project idea
- Demonstrate domain expertise in their industry
- Ask something that shows you understand their space but need clarification on a key detail
` : `
- Build directly on their previous answers
- Reference specific things they mentioned
- Help them discover needs they haven't articulated
- Guide them toward strategic thinking about their product
`}

The question should:
1. Show active listening ("You mentioned event templates...")
2. Demonstrate industry knowledge 
3. Uncover critical missing information
4. Help them ideate and discover new requirements
5. Be conversational but strategic

Generate exactly ONE question that would help create comprehensive product requirements for a tool like Lovable.

Return as JSON:
{
  "question": "Your thoughtful question here",
  "category": "audience/features/business/technical/vision",
  "reasoning": "Why this question matters for their success"
}`;

    // Try GPT-5 first, fallback to GPT-4o if it fails
    let response;
    let requestBody;
    
    try {
      // First attempt with GPT-5 using minimal parameters (no max_tokens)
      requestBody = {
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the next strategic question.' }
        ]
      };
      
      console.log('Attempting GPT-5 with request:', JSON.stringify(requestBody));
      
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('GPT-5 Response status:', response.status);
      console.log('GPT-5 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GPT-5 failed with error:', errorText);
        throw new Error(`GPT-5 failed with status ${response.status}: ${errorText}`);
      }
    } catch (gpt5Error) {
      console.warn('GPT-5 failed, falling back to GPT-4o:', gpt5Error);
      
      // Fallback to GPT-4o
      requestBody = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the next strategic question.' }
        ],
        max_tokens: 800,
        temperature: 0.4
      };
      
      console.log('Attempting GPT-4o fallback with request:', JSON.stringify(requestBody));
      
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      console.error('Request body that failed:', JSON.stringify(requestBody));
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Full OpenAI response:', JSON.stringify(data));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    const content = data.choices[0].message.content;
    console.log('OpenAI message content:', JSON.stringify(content));
    console.log('Content type:', typeof content);
    console.log('Content length:', content?.length || 0);
    
    if (!content || content.trim() === '') {
      console.error('Empty content received from OpenAI API');
      throw new Error('Empty response from OpenAI API');
    }
    
    const result = parseOpenAIResponse(content);

    console.log('Generated question:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-dynamic-questions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate dynamic question'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});