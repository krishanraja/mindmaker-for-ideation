import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Brain, Target, Users, DollarSign, Clock, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  question: string;
  subtitle?: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  category: 'business' | 'pain_points' | 'goals' | 'resources' | 'timeline';
  icon: React.ReactNode;
}

interface StructuredQuestionnaireProps {
  onComplete: (data: any) => void;
  anonymousSessionId?: string;
  initialData?: any;
}

const questions: Question[] = [
  {
    id: 'business_challenge',
    type: 'textarea',
    question: 'What is your biggest business challenge right now?',
    subtitle: 'Be specific about what\'s not working or what you\'re trying to improve',
    placeholder: 'e.g., Manual data entry is taking 5+ hours daily, customers are waiting too long for responses...',
    required: true,
    category: 'pain_points',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'company_info',
    type: 'text',
    question: 'What\'s your company name and your role?',
    subtitle: 'This helps us provide more relevant recommendations',
    placeholder: 'e.g., ABC Corp - CEO / Marketing Director at XYZ Inc',
    required: true,
    category: 'business',
    icon: <Building className="h-5 w-5" />
  },
  {
    id: 'industry',
    type: 'select',
    question: 'Which industry best describes your business?',
    subtitle: 'Each industry has unique AI opportunities',
    options: [
      'Healthcare & Medical',
      'Financial Services',
      'Technology & Software',
      'Retail & E-commerce',
      'Manufacturing',
      'Professional Services',
      'Real Estate',
      'Education',
      'Marketing & Advertising',
      'Legal Services',
      'Other'
    ],
    required: true,
    category: 'business',
    icon: <Building className="h-5 w-5" />
  },
  {
    id: 'company_size',
    type: 'select',
    question: 'How many people work at your company?',
    subtitle: 'This affects which AI solutions will be most practical',
    options: [
      'Just me (1)',
      'Small team (2-10)',
      'Growing business (11-50)',
      'Mid-size company (51-200)',
      'Large enterprise (200+)'
    ],
    required: true,
    category: 'business',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'manual_processes',
    type: 'textarea',
    question: 'What tasks are you or your team doing manually that feel repetitive?',
    subtitle: 'These are often the best candidates for AI automation',
    placeholder: 'e.g., Responding to customer emails, data entry from PDFs, scheduling meetings, creating reports...',
    required: true,
    category: 'pain_points',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'desired_outcome',
    type: 'textarea',
    question: 'If you could wave a magic wand, what would your ideal outcome look like?',
    subtitle: 'Help us understand your vision for success',
    placeholder: 'e.g., Save 10 hours per week, increase customer satisfaction by 50%, double our lead conversion rate...',
    required: true,
    category: 'goals',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'budget_range',
    type: 'select',
    question: 'What\'s your potential budget range for an AI solution?',
    subtitle: 'This helps us recommend the right approach for your situation',
    options: [
      'Under $1,000/month',
      '$1,000 - $5,000/month',
      '$5,000 - $15,000/month',
      '$15,000 - $50,000/month',
      '$50,000+/month',
      'Not sure yet - need to understand ROI first'
    ],
    required: true,
    category: 'resources',
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: 'timeline',
    type: 'select',
    question: 'How urgently do you need a solution?',
    subtitle: 'This affects our recommended implementation approach',
    options: [
      'Extremely urgent - need results within 30 days',
      'High priority - within 2-3 months',
      'Important but flexible - within 6 months',
      'Exploring options - no specific timeline'
    ],
    required: true,
    category: 'timeline',
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: 'email_contact',
    type: 'text',
    question: 'What\'s your email address?',
    subtitle: 'We\'ll send you a personalized AI strategy blueprint based on your answers',
    placeholder: 'your@email.com',
    required: true,
    category: 'business',
    icon: <Brain className="h-5 w-5" />
  }
];

const StructuredQuestionnaire: React.FC<StructuredQuestionnaireProps> = ({
  onComplete,
  anonymousSessionId,
  initialData = {}
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = answers[currentQuestion.id]?.toString().trim();

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);
    try {
      // Store the questionnaire data
      const { error } = await supabase
        .from('lead_qualification_data')
        .insert({
          anonymous_session_id: anonymousSessionId,
          qualification_criteria: {
            questionnaire_answers: answers,
            completion_date: new Date().toISOString(),
            questionnaire_version: '1.0'
          },
          pain_point_severity: 8, // High since they completed the questionnaire
          budget_qualified: true,
          timeline_qualified: true,
          authority_level: 7,
          need_urgency: 7,
          fit_score: 0.85,
          conversion_probability: 0.75,
          recommended_service: 'AI Strategy Blueprint',
          next_action: 'Generate personalized blueprint',
          notes: `Completed structured questionnaire. Email: ${answers.email_contact}`,
          follow_up_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day from now
        });

      if (error) throw error;

      // Call completion handler with the answers
      onComplete(answers);

      toast({
        title: "Analysis Complete!",
        description: "Generating your personalized AI strategy blueprint...",
      });

    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    const question = currentQuestion;
    const value = answers[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="text-base h-12"
            disabled={isSubmitting}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="min-h-[120px] text-base resize-none"
            disabled={isSubmitting}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(selectedValue) => handleAnswerChange(question.id, selectedValue)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Choose an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option} className="text-base">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {currentQuestion.icon}
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-3 text-xs">
                      {currentQuestion.category.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <CardTitle className="text-xl font-semibold mb-2">
                      {currentQuestion.question}
                    </CardTitle>
                    {currentQuestion.subtitle && (
                      <p className="text-muted-foreground text-sm">
                        {currentQuestion.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="answer" className="sr-only">Your answer</Label>
                  {renderInput()}
                </div>

                <div className="flex justify-between gap-3">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || isSubmitting}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed || isSubmitting}
                    className="flex-1"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : isLastQuestion ? (
                      <>
                        Generate Blueprint
                        <Brain className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StructuredQuestionnaire;