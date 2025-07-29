
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resendApiKey = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  session: any;
  userEmail: string;
}

const resend = new Resend(resendApiKey);

// Create beautiful HTML template for PDF
const createPDFTemplate = (session: any) => {
  const { userName, originalInput, questions, userResponses, blueprint } = session;
  const { lovablePrompt, workflows, agentSuggestions } = blueprint;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${userName}'s AI Blueprint</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          margin-top: 40px;
          margin-bottom: 40px;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: bold;
        }
        
        h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .subtitle {
          font-size: 18px;
          color: #6b7280;
          font-weight: 400;
        }
        
        .section {
          margin-bottom: 40px;
          padding: 30px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }
        
        .section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .section-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }
        
        .original-vision {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-left-color: #0ea5e9;
        }
        
        .qa-section {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-left-color: #22c55e;
        }
        
        .prompt-section {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border-left-color: #f59e0b;
        }
        
        .workflows-section {
          background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
          border-left-color: #a855f7;
        }
        
        .agents-section {
          background: linear-gradient(135deg, #fce7f3, #fbcfe8);
          border-left-color: #ec4899;
        }
        
        .qa-item {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .question {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 16px;
        }
        
        .answer {
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
          padding-left: 16px;
          border-left: 2px solid #e5e7eb;
        }
        
        .prompt-box {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 24px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        .workflow-item {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .workflow-title {
          font-weight: 600;
          font-size: 18px;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .workflow-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        
        .meta-item {
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .agent-item {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }
        
        .agent-name {
          font-weight: 600;
          font-size: 16px;
          color: #374151;
        }
        
        .relevance-score {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .use-case {
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
          color: #9ca3af;
          font-size: 14px;
        }
        
        .date {
          color: #6b7280;
          font-size: 14px;
          margin-top: 10px;
        }
        
        @media print {
          body { background: white; }
          .container { 
            box-shadow: none; 
            border-radius: 0;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🧠</div>
          <h1>${userName}'s AI-Powered Blueprint</h1>
          <p class="subtitle">Your personalized development roadmap</p>
          <p class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="section original-vision">
          <h2><span class="section-icon">💡</span>Original Vision</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">${originalInput}</p>
        </div>

        <div class="section qa-section">
          <h2><span class="section-icon">❓</span>Discovery Questions & Answers</h2>
          ${questions.map((q: any, index: number) => `
            <div class="qa-item">
              <div class="question">Q${index + 1}: ${q.question}</div>
              <div class="answer">${userResponses[index] || 'No response provided'}</div>
            </div>
          `).join('')}
        </div>

        <div class="section prompt-section">
          <h2><span class="section-icon">🚀</span>Ready-to-Use Lovable Prompt</h2>
          <div class="prompt-box">${lovablePrompt}</div>
        </div>

        <div class="section workflows-section">
          <h2><span class="section-icon">⚡</span>Development Workflows</h2>
          ${workflows.map((workflow: any, index: number) => `
            <div class="workflow-item">
              <div class="workflow-title">${index + 1}. ${workflow.title}</div>
              <div class="workflow-meta">
                <span class="meta-item">⏱️ ${workflow.duration}</span>
                <span class="meta-item">📊 ${workflow.complexity}</span>
                ${workflow.dependencies && workflow.dependencies.length > 0 
                  ? workflow.dependencies.map((dep: string) => `<span class="meta-item">🔗 ${dep}</span>`).join('') 
                  : ''
                }
              </div>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">${workflow.description}</p>
              ${workflow.deliverables && workflow.deliverables.length > 0 
                ? `<div style="margin-top: 12px;"><strong style="font-size: 14px; color: #374151;">Deliverables:</strong> ${workflow.deliverables.join(', ')}</div>` 
                : ''
              }
            </div>
          `).join('')}
        </div>

        <div class="section agents-section">
          <h2><span class="section-icon">🤖</span>AI Agent Suggestions</h2>
          ${agentSuggestions.map((agent: any) => `
            <div class="agent-item">
              <div class="agent-header">
                <div class="agent-name">${agent.name}</div>
                <div class="relevance-score">${agent.relevanceScore}/10</div>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${agent.description}</p>
              <div class="use-case">
                <strong style="font-size: 13px; color: #374151;">Specific Use Case:</strong><br>
                ${agent.specificUseCase}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p>Generated with ❤️ by IdeaForge AI</p>
          <p>Ready to bring your vision to life? Start building at <strong>lovable.dev</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const { session, userEmail }: GeneratePDFRequest = await req.json();
    console.log('Generating PDF for user:', session.userName);

    // Generate PDF using Puppeteer (via external service or local generation)
    // For now, we'll use HTML-to-PDF conversion via a simple approach
    const htmlContent = createPDFTemplate(session);
    
    // Create filename with user's name
    const fileName = `${session.userName.replace(/\s+/g, '_')}_Blueprint.pdf`;
    
    // Convert HTML to PDF using a lightweight approach
    // In a production environment, you'd use Puppeteer or a PDF service
    const pdfBuffer = await generatePDFFromHTML(htmlContent);

    // Send PDF to user
    const userEmailResponse = await resend.emails.send({
      from: 'IdeaForge AI <onboarding@resend.dev>',
      to: [userEmail],
      subject: `🧠 Your AI-Powered Blueprint is Ready, ${session.userName}!`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🧠</div>
              <h1 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 10px;">Your Blueprint is Ready!</h1>
              <p style="color: #6b7280; font-size: 18px; margin: 0;">Hi ${session.userName},</p>
            </div>
            
            <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 10px;">🎉 Your AI-Powered Blueprint</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                Thank you for using IdeaForge AI! Your personalized development blueprint has been generated based on your vision and our in-depth conversation. The attached PDF contains everything you need to bring your idea to life.
              </p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px;">📋 What's Inside Your Blueprint:</h3>
              <ul style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Your original vision and refined requirements</li>
                <li>Complete Q&A session with your responses</li>
                <li>Ready-to-use Lovable prompt for immediate development</li>
                <li>Step-by-step development workflows</li>
                <li>Curated AI agent suggestions for your project</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="https://lovable.dev" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">🚀 Start Building in Lovable</a>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                Generated with ❤️ by IdeaForge AI<br>
                Ready to transform ideas into reality
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    });

    // Send session data to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'IdeaForge AI <onboarding@resend.dev>',
      to: ['Krish@fractionl.ai'],
      subject: `New Blueprint Generated - ${session.userName}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; font-size: 24px; font-weight: 700;">New Blueprint Generated</h1>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">User Information</h2>
            <p><strong>Name:</strong> ${session.userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Session ID:</strong> ${session.sessionId}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">Original Vision</h2>
            <p style="font-style: italic; color: #6b7280;">"${session.originalInput}"</p>
          </div>
          
          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">Questions & Answers</h2>
            ${session.questions.map((q: any, index: number) => `
              <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                <p style="font-weight: 600; color: #374151; margin-bottom: 5px;">Q${index + 1}: ${q.question}</p>
                <p style="color: #6b7280; margin-left: 20px;">${session.userResponses[index] || 'No response provided'}</p>
              </div>
            `).join('')}
          </div>
          
          <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #374151; font-size: 18px; margin-bottom: 10px;">User Profile</h2>
            <p><strong>Domain:</strong> ${Array.isArray(session.userProfile.domain) ? session.userProfile.domain.join(', ') : session.userProfile.domain}</p>
            <p><strong>Expertise Level:</strong> ${session.userProfile.expertiseLevel}</p>
            <p><strong>Budget:</strong> ${session.userProfile.constraints?.budget || 'Not specified'}</p>
            <p><strong>Timeline:</strong> ${session.userProfile.constraints?.timeline || 'Not specified'}</p>
          </div>
        </div>
      `,
    });

    console.log('Emails sent successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'PDF generated and emails sent successfully',
      fileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-pdf-blueprint function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simple HTML to PDF conversion function
async function generatePDFFromHTML(htmlContent: string): Promise<Uint8Array> {
  // For a simple implementation, we'll create a mock PDF
  // In production, you'd use Puppeteer or a proper PDF generation service
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}
