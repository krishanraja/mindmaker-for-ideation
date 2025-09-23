import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Question {
  question: string;
  rationale: string;
  category?: string;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious?: () => void;
  canProceed: boolean;
  isGenerating?: boolean;
  showPrevious?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  value,
  onChange,
  onNext,
  onPrevious,
  canProceed,
  isGenerating = false,
  showPrevious = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-card backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="text-xs">
                Question {questionNumber} of {totalQuestions}
              </Badge>
            </div>
            {question.category && (
              <Badge variant="outline" className="text-xs">
                {question.category}
              </Badge>
            )}
          </div>
          
          <div className="space-y-4 text-left">
            <h2 className="text-lg font-semibold text-foreground leading-relaxed">
              {question.question.split(/(?<=[.!?])\s+/).map((sentence, index) => (
                <span key={index} className="block mb-2 last:mb-0">
                  {sentence.trim()}
                </span>
              ))}
            </h2>
            
            <div className="border-l-2 border-primary/20 pl-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-primary/80">Context: </span>
                {question.rationale.split(/(?<=[.!?])\s+/).map((sentence, index) => (
                  <span key={index} className="block mb-1.5 last:mb-0">
                    {sentence.trim()}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Your Response
            </label>
            <Textarea
              placeholder="Share your thoughts in detail..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[120px] resize-none bg-input/50 border-border/50 focus:border-primary/50 focus:bg-input transition-all duration-300"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1 h-1 bg-primary rounded-full"></span>
              The more detail you provide, the better your blueprint will be
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            {showPrevious && onPrevious && (
              <Button
                onClick={onPrevious}
                variant="outline"
                className="flex-1 h-12 bg-transparent border-border/50 hover:bg-secondary/50"
                disabled={isGenerating}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            <Button
              onClick={onNext}
              disabled={!canProceed || isGenerating}
              className="flex-1 h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 text-primary-foreground shadow-elegant transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                  Processing...
                </>
              ) : (
                <>
                  {questionNumber === totalQuestions ? 'Generate Blueprint' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionCard;