import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowRight, Sparkles, Target, Users, Workflow, CheckCircle, Brain, MessageSquare, Rocket, Zap, Cpu, Network, Database } from "lucide-react";
import ConversationStep from "@/components/ConversationStep";
import ProgressSidebar from "@/components/ProgressSidebar";
import NeuronLoop from "@/components/NeuronLoop";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface MindmakerSession {
  sessionId: string;
  originalInput: string;
  semanticAnalysis: any;
  conceptualMap: any;
  questions: any[];
  userResponses: string[];
  conversationContext: string[];
  userProfile: {
    expertiseLevel: string;
    domain: string;
    constraints: string[];
    goals: string[];
    previousResponses: string[];
  };
  blueprint: {
    lovablePrompt: string;
    workflows: WorkflowStep[];
    agentSuggestions: AgentSuggestion[];
  } | null;
  currentStep: 'input' | 'clarification' | 'blueprint';
  questionRound: number;
}

const Index = () => {
  const [userInput, setUserInput] = useState("");
  const [session, setSession] = useState<MindmakerSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const { toast } = useToast();

  const handleStart = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your idea before starting.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await analyzeInput(userInput);
    } catch (error) {
      console.error("Error starting analysis:", error);
      toast({
        title: "Error",
        description: "Failed to start analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeInput = async (input: string) => {
    console.log("Starting AI-powered semantic analysis for:", input);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-input', {
        body: { input }
      });

      if (error) throw error;

      const { analysis, userProfile, questions } = data;
      console.log("AI analysis complete:", { analysis, userProfile, questions });

      const newSession: MindmakerSession = {
        sessionId: Math.random().toString(36).substr(2, 9),
        originalInput: input,
        semanticAnalysis: analysis,
        conceptualMap: {},
        questions,
        userResponses: [],
        conversationContext: [input],
        userProfile,
        blueprint: null,
        currentStep: 'clarification',
        questionRound: 1,
      };

      setSession(newSession);
      console.log("Session created:", newSession);
    } catch (error) {
      console.error("Error in AI analysis:", error);
      throw error;
    }
  };


  const handleClarificationSubmit = async () => {
    if (!currentResponse.trim() || !session) return;

    setIsGenerating(true);
    try {
      const updatedSession = {
        ...session,
        userResponses: [...session.userResponses, currentResponse],
        conversationContext: [...session.conversationContext, currentResponse],
        userProfile: {
          ...session.userProfile,
          previousResponses: [...session.userProfile.previousResponses, currentResponse]
        }
      };

      // Check if more questions are needed
      const { data: shouldContinueData, error: shouldContinueError } = await supabase.functions.invoke('generate-questions', {
        body: { session: updatedSession, type: 'should_continue' }
      });

      if (shouldContinueError) throw shouldContinueError;

      const shouldContinue = shouldContinueData.result.shouldContinue;
      
      if (shouldContinue && updatedSession.questionRound < 3) {
        // Generate follow-up questions
        const { data: questionsData, error: questionsError } = await supabase.functions.invoke('generate-questions', {
          body: { session: updatedSession, type: 'followup' }
        });

        if (questionsError) throw questionsError;

        updatedSession.questions = questionsData.result;
        updatedSession.questionRound += 1;
        setSession(updatedSession);
      } else {
        // Generate the blueprint
        await generateIntelligentBlueprint(updatedSession);
      }
      
      setCurrentResponse("");
    } catch (error) {
      console.error("Error in clarification:", error);
      toast({
        title: "Error",
        description: "Failed to process response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  const generateIntelligentBlueprint = async (session: MindmakerSession) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-blueprint', {
        body: { session }
      });

      if (error) throw error;

      const { blueprint } = data;

      setSession({
        ...session,
        blueprint,
        currentStep: 'blueprint'
      });
    } catch (error) {
      console.error("Error generating blueprint:", error);
      throw error;
    }
  };



  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Brain className="h-16 w-16 text-purple-600 mr-4" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MindMaker
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into actionable blueprints with AI-powered analysis. 
            Get personalized Lovable prompts, intelligent workflows, and curated agent recommendations.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-gray-200 shadow-xl bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Describe Your Vision</CardTitle>
              <CardDescription className="text-lg">
                Share your idea, project concept, or development challenge. Be as detailed as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea
                placeholder="Describe your vision, idea, or project in detail..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[120px] text-base leading-relaxed resize-none"
                disabled={isGenerating}
              />
              <Button
                onClick={handleStart}
                disabled={!userInput.trim() || isGenerating}
                className="w-full mt-4 h-12 text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Brain className="mr-2 h-5 w-5 animate-spin" />
                    AI Analyzing...
                  </>
                 ) : (
                   <>
                     <Sparkles className="mr-2 h-5 w-5" />
                     Start AI Analysis
                   </>
                 )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );

  const renderClarificationStep = () => {
    if (!session) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row">
          <ProgressSidebar currentStep={2} totalSteps={7} />

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-8/12 lg:w-9/12 ml-0 md:ml-8"
          >
            <Card className="border-gray-200 shadow-xl bg-white/80 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Clarification Round {session.questionRound}</CardTitle>
                <CardDescription className="text-lg">
                  Please answer the following questions to help refine your blueprint.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {session.questions.map((question, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {question.question}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {question.rationale}
                    </p>
                  </div>
                ))}
                <Textarea
                  placeholder="Your response..."
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  className="min-h-[100px] text-base leading-relaxed resize-none"
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleClarificationSubmit}
                  disabled={!currentResponse.trim() || isGenerating}
                  className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="mr-2 h-5 w-5 animate-spin" />
                      Generating Next Steps...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Submit Response
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderBlueprintStep = () => {
    if (!session || !session.blueprint) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row">
          <ProgressSidebar currentStep={7} totalSteps={7} />

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-8/12 lg:w-9/12 ml-0 md:ml-8 space-y-6"
          >
            <Card className="border-gray-200 shadow-xl bg-white/80 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Your AI-Powered Blueprint</CardTitle>
                <CardDescription className="text-lg">
                  Here's a personalized blueprint to bring your vision to life.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-400 flex items-center">
                    <Lightbulb className="mr-2 h-6 w-6" /> Lovable Prompt
                  </h3>
                  <Textarea
                    value={session.blueprint.lovablePrompt}
                    className="min-h-[80px] text-base leading-relaxed resize-none"
                    readOnly
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 flex items-center">
                    <Workflow className="mr-2 h-6 w-6" /> Intelligent Workflows
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {session.blueprint.workflows.map((step, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-200">
                        <span className="font-medium">{step.title}:</span> {step.description}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 flex items-center">
                    <Users className="mr-2 h-6 w-6" /> Contextual Agent Suggestions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {session.blueprint.agentSuggestions.map((agent, index) => (
                      <Card key={index} className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-medium">{agent.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            {agent.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Badge variant="secondary">Category: {agent.category}</Badge>
                          <p className="text-gray-700 dark:text-gray-300">
                            Use Case: {agent.specificUseCase}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            Relevance: {agent.relevanceScore}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  };

  if (!session) {
    return renderWelcomeScreen();
  }

  if (session.currentStep === 'clarification') {
    return renderClarificationStep();
  }

  if (session.currentStep === 'blueprint') {
    return renderBlueprintStep();
  }

  return <div>Feature coming soon with real AI integration...</div>;
};

export default Index;
