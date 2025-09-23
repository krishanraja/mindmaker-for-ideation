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

    const { analysis, conversationHistory, userName, initialInput } = await req.json();
    
    if (!analysis || !conversationHistory) {
      throw new Error('Analysis and conversation history are required');
    }

    console.log('Generating comprehensive blueprint for:', userName);

    const conversationContext = conversationHistory.map((item: any, i: number) => 
      `Q${i+1}: ${item.question}\nA${i+1}: ${item.answer}`
    ).join('\n\n');

    const prompt = `You are Krish's AI clone, a world-class business strategist and product consultant. Generate a comprehensive business and product blueprint based on this deep consultation.

USER CONTEXT:
Name: ${userName}
Initial Vision: ${initialInput}

BUSINESS ANALYSIS:
${JSON.stringify(analysis, null, 2)}

FULL CONVERSATION:
${conversationContext}

Generate a comprehensive blueprint that includes:

1. EXECUTIVE SUMMARY
   - Clear product vision statement
   - Target market definition  
   - Unique value proposition
   - Business opportunity size

2. TECHNICAL SPECIFICATIONS (Lovable-Ready)
   - Detailed feature requirements
   - User interface mockup descriptions
   - Database schema requirements
   - Integration needs
   - Technical architecture recommendations

3. USER EXPERIENCE BLUEPRINT
   - User journey mapping
   - Key user personas
   - Interface design principles
   - Branding and visual style recommendations

4. BUSINESS STRATEGY
   - Go-to-market strategy
   - Revenue model recommendations
   - Competitive positioning
   - Scaling roadmap

5. IMPLEMENTATION ROADMAP
   - MVP features priority
   - Development phases
   - Key milestones
   - Resource requirements

6. LOVABLE PROMPTS
   - 3-5 specific, detailed prompts that could be used with Lovable
   - Each prompt should be comprehensive enough to build nearly perfect functionality
   - Include UI/UX specifications, technical requirements, and business logic

Make this feel inspirational and comprehensive. The user should feel excited about their vision and confident in the next steps.

Return as JSON with clear sections and actionable insights.`;

    // Try GPT-5 first, fallback to GPT-4o if it fails
    let response;
    let requestBody;
    
    try {
      // First attempt with GPT-5 using max_tokens
      requestBody = {
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the comprehensive business and product blueprint.' }
        ],
        max_tokens: 4000
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
      
      if (!response.ok) {
        throw new Error(`GPT-5 failed with status ${response.status}`);
      }
    } catch (gpt5Error) {
      console.warn('GPT-5 failed, falling back to GPT-4o:', gpt5Error);
      
      // Fallback to GPT-4o
      requestBody = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate the comprehensive business and product blueprint.' }
        ],
        max_tokens: 4000,
        temperature: 0.7
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
    
    const blueprint = parseOpenAIResponse(content);

    console.log('Blueprint generated successfully');

    return new Response(JSON.stringify({ 
      blueprint,
      generatedAt: new Date().toISOString(),
      disclaimer: "This blueprint was generated by Krish's AI clone. All recommendations should be validated through a 1-on-1 consultation with the real Krish for business-critical decisions."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-comprehensive-blueprint function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate comprehensive blueprint'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});