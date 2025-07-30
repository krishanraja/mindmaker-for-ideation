import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Lightbulb, Workflow, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface WorkflowStep {
  title: string;
  description: string;
  duration: string;
  dependencies: string[];
  deliverables: string[];
  complexity: string;
}

interface AgentSuggestion {
  name: string;
  description: string;
  category: string;
  relevanceScore: number;
  specificUseCase: string;
}

interface Blueprint {
  lovablePrompt: string;
  workflows: WorkflowStep[];
  agentSuggestions: AgentSuggestion[];
}

interface BlueprintResultsProps {
  blueprint: Blueprint;
  originalInput: string;
  session?: any; // Add session data to props
}

const BlueprintResults: React.FC<BlueprintResultsProps> = ({ blueprint, originalInput, session }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      toast({
        title: "Copied!",
        description: `${itemName} copied to clipboard`,
      });
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportBlueprint = () => {
    const content = `# AI-Generated Blueprint

## Original Vision
${originalInput}

## Lovable Prompt
${blueprint.lovablePrompt}

## Development Workflows
${blueprint.workflows.map((step, index) => `
### ${index + 1}. ${step.title}
**Description:** ${step.description}
**Duration:** ${step.duration}
**Complexity:** ${step.complexity}
**Dependencies:** ${step.dependencies.join(', ') || 'None'}
**Deliverables:** ${step.deliverables.join(', ')}
`).join('\n')}

## Agent Suggestions
${blueprint.agentSuggestions.map((agent, index) => `
### ${index + 1}. ${agent.name}
**Category:** ${agent.category}
**Description:** ${agent.description}
**Use Case:** ${agent.specificUseCase}
**Relevance Score:** ${agent.relevanceScore}/10
`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blueprint.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Blueprint exported as Markdown file",
    });
  };

  const handlePDFDownload = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to add text with auto-wrap and pagination
      const addTextToPDF = (text: string, fontSize: number, isBold: boolean = false, color: string = '#000000') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        
        for (const line of lines) {
          if (yPosition > pageHeight - margin - 10) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += fontSize * 0.4;
        }
        yPosition += 5; // Extra spacing after text block
      };

      // Helper function to add section header
      const addSectionHeader = (title: string, emoji: string) => {
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        
        // Add some space before section
        yPosition += 8;
        
        // Add colored background for header
        pdf.setFillColor(240, 245, 255);
        pdf.rect(margin, yPosition - 8, contentWidth, 12, 'F');
        
        // Add header text
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#1f2937');
        pdf.text(`${emoji} ${title}`, margin + 3, yPosition);
        yPosition += 15;
      };

      // Add logo and header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#1f2937');
      pdf.text(`${session?.userName || 'User'}'s AI-Powered Blueprint`, margin, yPosition);
      yPosition += 12;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#6b7280');
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin, yPosition);
      yPosition += 15;

      // Add horizontal line
      pdf.setDrawColor('#e5e7eb');
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Original Vision Section
      addSectionHeader('Original Vision', '💡');
      addTextToPDF(originalInput || 'No vision provided', 11, false, '#374151');

      // Q&A Section
      if (session?.questions && session.questions.length > 0) {
        addSectionHeader('Discovery Questions & Answers', '❓');
        session.questions.forEach((q: any, index: number) => {
          addTextToPDF(`Q${index + 1}: ${q.question}`, 11, true, '#374151');
          addTextToPDF(`A: ${session.userResponses?.[index] || 'No response provided'}`, 10, false, '#6b7280');
          yPosition += 3;
        });
      }

      // Lovable Prompt Section
      addSectionHeader('Ready-to-Use Lovable Prompt', '🚀');
      addTextToPDF(blueprint.lovablePrompt, 9, false, '#374151');

      // Workflows Section
      addSectionHeader('Development Workflows', '⚡');
      blueprint.workflows.forEach((workflow: any, index: number) => {
        addTextToPDF(`${index + 1}. ${workflow.title}`, 12, true, '#374151');
        addTextToPDF(`Duration: ${workflow.duration} | Complexity: ${workflow.complexity}`, 10, false, '#6b7280');
        addTextToPDF(workflow.description, 10, false, '#374151');
        if (workflow.deliverables && workflow.deliverables.length > 0) {
          addTextToPDF(`Deliverables: ${workflow.deliverables.join(', ')}`, 10, false, '#6b7280');
        }
        yPosition += 5;
      });

      // Agent Suggestions Section
      addSectionHeader('AI Agent Suggestions', '🤖');
      blueprint.agentSuggestions.forEach((agent: any) => {
        addTextToPDF(`${agent.name} (${agent.relevanceScore}/10)`, 12, true, '#374151');
        addTextToPDF(`Category: ${agent.category}`, 10, false, '#6b7280');
        addTextToPDF(agent.description, 10, false, '#374151');
        addTextToPDF(`Use Case: ${agent.specificUseCase}`, 10, false, '#6b7280');
        yPosition += 5;
      });

      // Footer
      if (yPosition > pageHeight - margin - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      yPosition = pageHeight - margin - 10;
      pdf.setFontSize(10);
      pdf.setTextColor('#9ca3af');
      pdf.text('Generated with ❤️ by FractionalAI | Ready to build? Visit lovable.dev', margin, yPosition);

      // Download PDF
      const fileName = `${session?.userName?.replace(/\s+/g, '_') || 'User'}_Blueprint.pdf`;
      pdf.save(fileName);

      // Send admin notification
      await sendAdminNotification();

      toast({
        title: "PDF Downloaded! 🎉",
        description: "Your blueprint has been downloaded to your computer.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const createPDFTemplate = () => {
    const { userName, originalInput, questions, userResponses } = session || {};
    const { lovablePrompt, workflows, agentSuggestions } = blueprint;

    return `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 30px; margin-bottom: 40px;">
          <img src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" alt="FractionalAI Logo" style="width: 80px; height: 80px; margin: 0 auto 20px; display: block;" />
          <h1 style="font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 8px;">${userName || 'User'}'s AI-Powered Blueprint</h1>
          <p style="font-size: 18px; color: #6b7280; font-weight: 400;">Your personalized development roadmap</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <!-- Original Vision -->
        <div style="margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; border-left: 4px solid #0ea5e9;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 16px;">💡</span>
            Original Vision
          </h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">${originalInput || 'No vision provided'}</p>
        </div>

        <!-- Q&A Section -->
        ${questions && questions.length > 0 ? `
        <div style="margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 12px; border-left: 4px solid #22c55e;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 16px;">❓</span>
            Discovery Questions & Answers
          </h2>
          ${questions.map((q: any, index: number) => `
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 16px;">Q${index + 1}: ${q.question}</div>
              <div style="color: #6b7280; font-size: 15px; line-height: 1.6; padding-left: 16px; border-left: 2px solid #e5e7eb;">${userResponses?.[index] || 'No response provided'}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <!-- Lovable Prompt -->
        <div style="margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; border-left: 4px solid #f59e0b;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 16px;">🚀</span>
            Ready-to-Use Lovable Prompt
          </h2>
          <div style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 24px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; color: #374151; white-space: pre-wrap; word-wrap: break-word;">${lovablePrompt}</div>
        </div>

        <!-- Workflows -->
        <div style="margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border-radius: 12px; border-left: 4px solid #a855f7;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #a855f7, #9333ea); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 16px;">⚡</span>
            Development Workflows
          </h2>
          ${workflows.map((workflow: any, index: number) => `
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              <div style="font-weight: 600; font-size: 18px; color: #374151; margin-bottom: 8px;">${index + 1}. ${workflow.title}</div>
              <div style="display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap;">
                <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 16px; font-size: 12px; color: #6b7280; font-weight: 500;">⏱️ ${workflow.duration}</span>
                <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 16px; font-size: 12px; color: #6b7280; font-weight: 500;">📊 ${workflow.complexity}</span>
              </div>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">${workflow.description}</p>
              ${workflow.deliverables && workflow.deliverables.length > 0 
                ? `<div style="margin-top: 12px;"><strong style="font-size: 14px; color: #374151;">Deliverables:</strong> ${workflow.deliverables.join(', ')}</div>` 
                : ''
              }
            </div>
          `).join('')}
        </div>

        <!-- Agent Suggestions -->
        <div style="margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #fce7f3, #fbcfe8); border-radius: 12px; border-left: 4px solid #ec4899;">
          <h2 style="font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 32px; height: 32px; background: linear-gradient(135deg, #ec4899, #db2777); border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 16px;">🤖</span>
            AI Agent Suggestions
          </h2>
          ${agentSuggestions.map((agent: any) => `
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div style="font-weight: 600; font-size: 16px; color: #374151;">${agent.name}</div>
                <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">${agent.relevanceScore}/10</div>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${agent.description}</p>
              <div style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 14px; color: #6b7280; margin-top: 8px;">
                <strong style="font-size: 13px; color: #374151;">Specific Use Case:</strong><br>
                ${agent.specificUseCase}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px;">
          <p>Generated with ❤️ by FractionalAI</p>
          <p>Ready to bring your vision to life? Start building at <strong>lovable.dev</strong></p>
        </div>
      </div>
    `;
  };

  const sendAdminNotification = async () => {
    try {
      await supabase.functions.invoke('send-admin-notification', {
        body: {
          session,
          originalInput,
          blueprint
        }
      });
    } catch (error) {
      console.error('Error sending admin notification:', error);
      // Don't show error to user as this is secondary functionality
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/a9a8850e-efa8-4ff3-be18-e9ca23a403a2.png" 
                alt="FractionalAI Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Your AI-Powered Blueprint
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Here's your personalized development roadmap, ready to bring your vision to life.
            </p>

            <div className="flex gap-3 justify-center mt-6">
              <Button 
                onClick={handlePDFDownload} 
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
              >
                <Download className="w-4 h-4" />
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </Button>
              <Button onClick={exportBlueprint} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Markdown
              </Button>
              <Button asChild variant="outline">
                <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Start Building in Lovable
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            <Tabs defaultValue="prompt" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="prompt" className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Lovable Prompt
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  Development Workflows
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  AI Agent Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prompt">
                <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Ready-to-Use Lovable Prompt
                      </span>
                      <Button
                        onClick={() => copyToClipboard(blueprint.lovablePrompt, "Lovable Prompt")}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {copiedItem === "Lovable Prompt" ? "✓" : <Copy className="w-4 h-4" />}
                        {copiedItem === "Lovable Prompt" ? "Copied!" : "Copy"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={blueprint.lovablePrompt}
                      readOnly
                      className="min-h-[200px] font-mono text-sm bg-muted/50 border-border/50"
                    />
                    <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        💡 <strong>How to use:</strong> Copy this prompt and paste it into Lovable to start building your application immediately. 
                        The prompt has been optimized based on your specific requirements and includes all necessary context.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflows">
                <div className="space-y-6">
                  {blueprint.workflows.map((workflow, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {index + 1}
                            </div>
                            {workflow.title}
                            <Badge variant="outline">{workflow.complexity}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground">{workflow.description}</p>
                          
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Duration</h4>
                              <Badge variant="secondary">{workflow.duration}</Badge>
                            </div>
                            
                            {workflow.dependencies.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Dependencies</h4>
                                <div className="flex flex-wrap gap-1">
                                  {workflow.dependencies.map((dep, depIndex) => (
                                    <Badge key={depIndex} variant="outline" className="text-xs">
                                      {dep}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2">Deliverables</h4>
                              <div className="flex flex-wrap gap-1">
                                {workflow.deliverables.map((deliverable, delIndex) => (
                                  <Badge key={delIndex} variant="outline" className="text-xs">
                                    {deliverable}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="agents">
                <div className="grid md:grid-cols-2 gap-6">
                  {blueprint.agentSuggestions.map((agent, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-card h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{agent.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{agent.category}</Badge>
                              <Badge variant="outline">{agent.relevanceScore}/10</Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-muted-foreground text-sm">{agent.description}</p>
                          <div>
                            <h4 className="font-medium text-sm mb-1">Specific Use Case</h4>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              {agent.specificUseCase}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default BlueprintResults;
