import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import WelcomeScreen from "@/components/WelcomeScreen";
import ModernProgressTracker from "@/components/ModernProgressTracker";
import QuestionCard from "@/components/QuestionCard";
import BlueprintResults from "@/components/BlueprintResults";
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

interface Question {
  question: string;
  rationale: string;
  category?: string;
}

interface IdeaForgeSession {
  sessionId: string;
  userName: string;
  originalInput: string;
  semanticAnalysis: any;
  questions: Question[];
  userResponses: string[];
  conversationContext: string[];
  userProfile: {
    expertiseLevel: string;
    domain: string[];
    constraints: {
      budget: string;
      timeline: string;
      resources: string;
    };
    goals: string[];
    previousResponses: any[];
  };
  blueprint: {
    lovablePrompt: string;
    workflows: WorkflowStep[];
    agentSuggestions: AgentSuggestion[];
  } | null;
  currentStep: 'input' | 'analysis' | 'questions' | 'blueprint';
  currentQuestionIndex: number;
  questionRound: number;
}

const Index = () => {
  const [userName, setUserName] = useState("");
  const [userInput, setUserInput] = useState("");
  const [session, setSession] = useState<IdeaForgeSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionResponse, setCurrentQuestionResponse] = useState("");
  const { toast } = useToast();

  const handleStart = async () => {
    if (!userName.trim() || !userInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter your name and describe your idea before starting.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await analyzeInput(userInput, userName);
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

  const analyzeInput = async (input: string, name: string) => {
    console.log("Starting AI-powered semantic analysis for:", input);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-input', {
        body: { input, userName: name }
      });

      if (error) throw error;

      const { analysis, userProfile: rawUserProfile, questions } = data;
      console.log("AI analysis complete:", { analysis, rawUserProfile, questions });

      // Handle potential nested userProfile structure
      const actualUserProfile = rawUserProfile?.userProfile || rawUserProfile;
      
      // Ensure previousResponses is initialized as an array
      const safeUserProfile = {
        ...actualUserProfile,
        previousResponses: actualUserProfile?.previousResponses || []
      };

      console.log("Processed user profile:", safeUserProfile);

      // Set up initial session with analysis phase
      setSession({
        sessionId: Math.random().toString(36).substr(2, 9),
        userName: name,
        originalInput: input,
        semanticAnalysis: analysis,
        questions: [],
        userResponses: [],
        conversationContext: [input],
        userProfile: safeUserProfile,
        blueprint: null,
        currentStep: 'analysis',
        currentQuestionIndex: 0,
        questionRound: 1,
      });

      // Brief delay to show analysis step, then load questions
      setTimeout(() => {
        const newSession: IdeaForgeSession = {
          sessionId: Math.random().toString(36).substr(2, 9),
          userName: name,
          originalInput: input,
          semanticAnalysis: analysis,
          questions,
          userResponses: [],
          conversationContext: [input],
          userProfile: safeUserProfile,
          blueprint: null,
          currentStep: 'questions',
          currentQuestionIndex: 0,
          questionRound: 1,
        };
        setSession(newSession);
      }, 2000);

    } catch (error) {
      console.error("Error in AI analysis:", error);
      throw error;
    }
  };


  const handleQuestionResponse = async () => {
    if (!currentQuestionResponse.trim() || !session) return;

    setIsGenerating(true);
    try {
      const updatedResponses = [...session.userResponses, currentQuestionResponse];
      const updatedSession = {
        ...session,
        userResponses: updatedResponses,
        conversationContext: [...session.conversationContext, currentQuestionResponse],
        userProfile: {
          ...session.userProfile,
          previousResponses: [
            ...(session.userProfile?.previousResponses || []), 
            { 
              response: currentQuestionResponse,
              questionIndex: session.currentQuestionIndex,
              round: session.questionRound
            }
          ]
        }
      };

      // Check if this is the last question
      if (session.currentQuestionIndex >= session.questions.length - 1) {
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

          setSession({
            ...updatedSession,
            questions: questionsData.result,
            questionRound: updatedSession.questionRound + 1,
            currentQuestionIndex: 0
          });
        } else {
          // Generate the blueprint
          await generateIntelligentBlueprint(updatedSession);
        }
      } else {
        // Move to next question
        setSession({
          ...updatedSession,
          currentQuestionIndex: session.currentQuestionIndex + 1
        });
      }
      
      setCurrentQuestionResponse("");
    } catch (error) {
      console.error("Error in question response:", error);
      toast({
        title: "Error",
        description: "Failed to process response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (!session || session.currentQuestionIndex <= 0) return;
    
    // Remove the last response and go back to previous question
    const updatedResponses = session.userResponses.slice(0, -1);
    setSession({
      ...session,
      userResponses: updatedResponses,
      currentQuestionIndex: session.currentQuestionIndex - 1
    });
    
    // Set the previous response as current response for editing
    setCurrentQuestionResponse(session.userResponses[session.currentQuestionIndex - 1] || "");
  };


  const generateIntelligentBlueprint = async (session: IdeaForgeSession) => {
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



  const renderAnalysisStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center">
      <div className="text-center">
        <ModernProgressTracker currentStep={2} totalSteps={4} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-glow mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-12 h-12 text-primary-foreground" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            AI Analyzing Your Vision
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Our advanced AI is processing your idea and preparing intelligent questions to refine your blueprint.
          </p>
        </motion.div>
      </div>
    </div>
  );

  const renderQuestionsStep = () => {
    if (!session || session.questions.length === 0) return null;

    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 py-12">
          <ModernProgressTracker currentStep={3} totalSteps={4} />
          
          <AnimatePresence mode="wait">
            <QuestionCard
              key={session.currentQuestionIndex}
              question={currentQuestion}
              questionNumber={session.currentQuestionIndex + 1}
              totalQuestions={session.questions.length}
              value={currentQuestionResponse}
              onChange={setCurrentQuestionResponse}
              onNext={handleQuestionResponse}
              onPrevious={session.currentQuestionIndex > 0 ? handlePreviousQuestion : undefined}
              canProceed={currentQuestionResponse.trim().length > 0}
              isGenerating={isGenerating}
              showPrevious={session.currentQuestionIndex > 0}
            />
          </AnimatePresence>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm">
              Round {session.questionRound} • {session.userResponses.length} responses collected
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBlueprintStep = () => {
    if (!session || !session.blueprint) return null;

    return (
      <div>
        <div className="container mx-auto px-4 py-12">
          <ModernProgressTracker currentStep={4} totalSteps={4} />
        </div>
        <BlueprintResults 
          blueprint={session.blueprint} 
          originalInput={session.originalInput}
        />
      </div>
    );
  };

  if (!session) {
    return (
      <WelcomeScreen
        userName={userName}
        setUserName={setUserName}
        userInput={userInput}
        setUserInput={setUserInput}
        onStart={handleStart}
        isGenerating={isGenerating}
      />
    );
  }

  if (session.currentStep === 'analysis') {
    return renderAnalysisStep();
  }

  if (session.currentStep === 'questions') {
    return renderQuestionsStep();
  }

  if (session.currentStep === 'blueprint') {
    return renderBlueprintStep();
  }

  return null;
};

export default Index;
