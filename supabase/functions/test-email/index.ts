import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resendApiKey = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== EMAIL TEST FUNCTION STARTED ===');
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found');
      throw new Error('Resend API key not configured');
    }
    console.log('✅ Resend API key is configured');

    const { testEmail }: { testEmail?: string } = await req.json();
    const recipient = testEmail || 'krish@fractionl.ai';

    console.log('📧 Attempting to send test email to:', recipient);

    const emailResponse = await resend.emails.send({
      from: 'FractionalAI Test <noreply@fractionl.ai>',
      to: [recipient],
      subject: `Email Test - ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937;">🎉 Email Test Successful!</h1>
          <p>This is a test email to verify that the email delivery system is working correctly.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>Recipient:</strong> ${recipient}</li>
              <li><strong>Sender:</strong> noreply@fractionl.ai</li>
              <li><strong>Domain:</strong> fractionl.ai</li>
            </ul>
          </div>
          <p>If you received this email, the delivery system is working properly! ✅</p>
          <hr style="margin: 30px 0; border: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test email from the FractionalAI Blueprint System.
          </p>
        </div>
      `,
    });

    console.log('📧 Email response:', JSON.stringify(emailResponse, null, 2));

    if (emailResponse.error) {
      console.error('❌ Email sending failed:', emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error}`);
    }

    console.log('✅ Test email sent successfully!');

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      recipient,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Test email error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});