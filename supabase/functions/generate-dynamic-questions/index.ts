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

    const { analysis, conversationHistory, questionIndex, originalProjectInput } = await req.json();
    
    if (!analysis) {
      throw new Error('Analysis context is required');
    }

    // Add original input to analysis for context
    if (originalProjectInput && analysis) {
      analysis.originalInput = originalProjectInput;
    }

const prompt = `You're having a friendly conversation with someone about their business idea. Based on what they've told you, ask the next natural question that helps them think through their business.

They initially described their idea as: "${analysis.originalInput || 'Not provided'}"

Here's what you've learned about their business so far:
Industry: ${analysis.industry}
Who they're building for: ${analysis.targetAudience}
Problem they're solving: ${analysis.coreProblem}
Their role: ${analysis.userRole}
How complex it might be: ${analysis.technicalComplexity}
What we still need to know: ${analysis.missingCriticalInfo?.join(', ')}

Previous conversation:
${conversationHistory?.map((item: any, i: number) => 
  `You asked: ${item.question}
They said: ${item.answer}`
).join('\n\n') || 'This is the first question'}

Now ask question #${questionIndex + 1}. Make it:
- Sound natural and conversational, like you're genuinely curious about their specific idea
- Reference their actual words and context from "${analysis.originalInput || 'their idea'}"
- Build directly on what they've shared so far
- Help them think through a logical next step for their business
- Avoid generic business advice - make it personal to their vision

IMPORTANT QUESTION PRIORITIES (ask these when relevant):
- Around question 2-3: Ask about existing websites/branding if they have any online presence to analyze
- Around question 3-4: Ask about visual preferences, design style, and branding requirements  
- Around question 4-5: Ask about technical requirements and integrations needed
- Around question 5-6: Ask about user experience and interface expectations

Example: Instead of "Who is your target market?" ask "You mentioned wanting to create 'beautiful, not boring events' - what would make an event beautiful in your eyes? What's an example of a boring event you'd want to avoid?"

For design questions: "Do you have an existing website or brand that this should match? If so, what's the URL so I can understand your current visual style?"

Think of it as helping a friend explore their specific idea, not giving generic business consulting advice.

Return as JSON:
{
  "question": "Your specific, contextual question here",
  "category": "Your Customers/What You're Building/Business Basics/Technical Stuff/Your Vision",
  "reasoning": "Why this specific question helps them with their particular idea"
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