import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, ArrowRight, ArrowLeft, CheckCircle, Loader2, Brain 
} from 'lucide-react';

interface DynamicQuestion {
  question: string;
  category: string;
  reasoning: string;
}

interface ConversationItem {
  question: string;
  answer: string;
  category: string;
}

interface StructuredQuestionnaireProps {
  onComplete: (data: any) => void;
  anonymousSessionId?: string;
  initialData?: {
    userName: string;
    userEmail: string;
    projectInput: string;
  };
}

const TOTAL_QUESTIONS = 6; // Dynamic questions plus final confirmation

const StructuredQuestionnaire: React.FC<StructuredQuestionnaireProps> = ({ 
  onComplete, 
  anonymousSessionId,
  initialData 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<DynamicQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

  // Initialize with analysis and first question
  useEffect(() => {
    if (initialData?.projectInput && !analysis) {
      analyzeInitialInput();
    }
  }, [initialData, analysis]);

  const analyzeInitialInput = async () => {
    setIsLoadingQuestion(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-initial-input', {
        body: {
          input: initialData?.projectInput,
          userName: initialData?.userName
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      await generateNextQuestion(data.analysis, []);
    } catch (error) {
      console.error('Error analyzing input:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const generateNextQuestion = async (analysisData: any, history: ConversationItem[]) => {
    setIsLoadingQuestion(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-dynamic-questions', {
        body: {
          analysis: analysisData,
          conversationHistory: history,
          questionIndex: currentQuestionIndex
        }
      });

      if (error) throw error;

      setCurrentQuestion(data);
    } catch (error) {
      console.error('Error generating question:', error);
      toast({
        title: "Error",
        description: "Failed to generate the next question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Add current Q&A to history
    const newHistoryItem: ConversationItem = {
      question: currentQuestion?.question || '',
      answer: currentAnswer,
      category: currentQuestion?.category || ''
    };
    
    const updatedHistory = [...conversationHistory, newHistoryItem];
    setConversationHistory(updatedHistory);
    setCurrentAnswer('');
    
    // Check if we've reached the end
    if (currentQuestionIndex >= TOTAL_QUESTIONS - 1) {
      await handleSubmit(updatedHistory);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      await generateNextQuestion(analysis, updatedHistory);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Restore previous answer
      const previousItem = conversationHistory[currentQuestionIndex - 1];
      if (previousItem) {
        setCurrentAnswer(previousItem.answer);
      }
      // Remove last item from history
      setConversationHistory(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (finalHistory: ConversationItem[]) => {
    setIsSubmitting(true);
    
    try {
      // Save to database
      const { error: dbError } = await supabase
        .from('lead_qualification_data')
        .insert({
          session_id: anonymousSessionId,
          user_name: initialData?.userName,
          user_email: initialData?.userEmail,
          project_description: initialData?.projectInput,
          questionnaire_data: {
            analysis,
            conversationHistory: finalHistory
          },
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Error saving questionnaire:', dbError);
        throw dbError;
      }

      // Generate comprehensive blueprint
      const { data: blueprintData, error: blueprintError } = await supabase.functions.invoke('generate-comprehensive-blueprint', {
        body: {
          analysis,
          conversationHistory: finalHistory,
          userName: initialData?.userName,
          initialInput: initialData?.projectInput
        }
      });

      if (blueprintError) {
        console.error('Error generating blueprint:', blueprintError);
        throw blueprintError;
      }

      toast({
        title: "Success!",
        description: "Your comprehensive blueprint has been generated!",
      });
      
      onComplete({
        analysis,
        conversationHistory: finalHistory,
        blueprint: blueprintData.blueprint,
        disclaimer: blueprintData.disclaimer
      });
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      toast({
        title: "Error",
        description: "Failed to generate your blueprint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    return (
      <Textarea
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        placeholder="Share your thoughts in detail..."
        className="min-h-[120px] text-base bg-white/50 border-white/20 focus:border-primary/50 focus:ring-primary/20"
        rows={4}
      />
    );
  };

  if (!currentQuestion && !isLoadingQuestion) {
    return null; // Still initializing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Strategic Business Discovery</h1>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Conversation History Preview */}
        {conversationHistory.length > 0 && (
          <div className="mb-6">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Previous insights:</h3>
                <div className="space-y-1">
                  {conversationHistory.slice(-2).map((item, index) => (
                    <div key={index} className="text-xs text-muted-foreground/80">
                      <span className="font-medium">{item.category}:</span> {item.answer.slice(0, 60)}...
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-8">
                {isLoadingQuestion ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Brain className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
                      <p className="text-lg font-medium text-foreground mb-2">Analyzing your response...</p>
                      <p className="text-sm text-muted-foreground">Crafting the perfect next question</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                          {currentQuestion?.question}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {currentQuestion?.reasoning}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      {renderInput()}
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0 || isLoadingQuestion}
                        className="bg-white/50 border-white/20 hover:bg-white/70"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      <Button
                        onClick={handleNext}
                        disabled={isSubmitting || isLoadingQuestion || !currentAnswer.trim()}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Blueprint...
                          </>
                        ) : currentQuestionIndex >= TOTAL_QUESTIONS - 1 ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Generate Blueprint
                          </>
                        ) : (
                          <>
                            Next Question
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StructuredQuestionnaire;