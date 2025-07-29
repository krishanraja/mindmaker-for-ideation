import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Lightbulb, Workflow, Users, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EmailCollectionModal from './EmailCollectionModal';

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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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

  const handlePDFGeneration = async (userEmail: string) => {
    setIsGeneratingPDF(true);
    try {
      // Use session data if available, otherwise create minimal session structure
      const sessionData = session || {
        userName: "User",
        originalInput,
        questions: [],
        userResponses: [],
        blueprint,
        sessionId: Math.random().toString(36).substr(2, 9),
        userProfile: {
          expertiseLevel: 'Unknown',
          domain: [],
          constraints: {},
          goals: []
        }
      };

      const { data, error } = await supabase.functions.invoke('generate-pdf-blueprint', {
        body: {
          session: sessionData,
          userEmail
        }
      });

      if (error) throw error;

      toast({
        title: "PDF Generated Successfully! 🎉",
        description: `Your blueprint PDF has been sent to ${userEmail}`,
      });

      setIsEmailModalOpen(false);
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
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-glow">
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Your AI-Powered Blueprint
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Here's your personalized development roadmap, ready to bring your vision to life.
            </p>

            <div className="flex gap-3 justify-center mt-6">
              <Button 
                onClick={() => setIsEmailModalOpen(true)} 
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
              >
                <Download className="w-4 h-4" />
                Get Beautiful PDF
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
                        {copiedItem === "Lovable Prompt" ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
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

      <EmailCollectionModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handlePDFGeneration}
        isGenerating={isGeneratingPDF}
        userName={session?.userName || "User"}
      />
    </>
  );
};

export default BlueprintResults;
