import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resendApiKey = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminNotificationRequest {
  session: any;
  originalInput: string;
  blueprint: any;
}

const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const { session, originalInput, blueprint }: AdminNotificationRequest = await req.json();
    console.log('Sending admin notification for user:', session?.userName);

    // Send comprehensive session data to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'FractionalAI <hello@krishraja.com>',
      to: ['krish@fractionl.ai'],
      subject: `New Blueprint Generated - ${session?.userName || 'Unknown User'}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" alt="FractionalAI Logo" style="width: 60px; height: 60px; margin: 0 auto 20px; display: block;" />
              <h1 style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0;">New Blueprint Generated</h1>
            </div>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">User Information</h2>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${session?.userName || 'Not provided'}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${session?.userEmail || 'Not provided'}</p>
              <p style="margin: 5px 0;"><strong>Session ID:</strong> ${session?.sessionId || 'Unknown'}</p>
              <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">Original Vision</h2>
              <p style="font-style: italic; color: #6b7280; line-height: 1.6;">"${originalInput || session?.originalInput || 'No vision provided'}"</p>
            </div>
            
            ${session?.questions && session.questions.length > 0 ? `
            <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">Questions & Answers (${session.questions.length} total)</h2>
              ${session.questions.map((q: any, index: number) => `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                  <p style="font-weight: 600; color: #374151; margin-bottom: 5px;">Q${index + 1}: ${q.question}</p>
                  <p style="color: #6b7280; margin-left: 20px; line-height: 1.6;">${session.userResponses?.[index] || 'No response provided'}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">User Profile</h2>
              <p style="margin: 5px 0;"><strong>Domain:</strong> ${Array.isArray(session?.userProfile?.domain) ? session.userProfile.domain.join(', ') : session?.userProfile?.domain || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>Expertise Level:</strong> ${session?.userProfile?.expertiseLevel || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>Budget:</strong> ${session?.userProfile?.constraints?.budget || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>Timeline:</strong> ${session?.userProfile?.constraints?.timeline || 'Not specified'}</p>
            </div>

            <div style="background: #f3e8ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #a855f7;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">Blueprint Summary</h2>
              <p style="margin: 5px 0;"><strong>Workflows Generated:</strong> ${blueprint?.workflows?.length || 0}</p>
              <p style="margin: 5px 0;"><strong>Agent Suggestions:</strong> ${blueprint?.agentSuggestions?.length || 0}</p>
              <p style="margin: 5px 0;"><strong>Lovable Prompt Length:</strong> ${blueprint?.lovablePrompt?.length || 0} characters</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Generated by FractionalAI Blueprint System<br>
                User downloaded PDF directly to their computer
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Admin notification sent successfully:', adminEmailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error sending admin notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});