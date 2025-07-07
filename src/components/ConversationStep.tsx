
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

interface ConversationStepProps {
  title: string;
  subtitle: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  canProceed: boolean;
  isTextarea?: boolean;
  hint?: string;
}

const ConversationStep: React.FC<ConversationStepProps> = ({
  title,
  subtitle,
  placeholder,
  value,
  onChange,
  onNext,
  canProceed,
  isTextarea = false,
  hint
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextarea && canProceed) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="bg-gray-800/50 border-purple-500/20 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">
            {title}
          </h2>
          <p className="text-gray-300 text-lg font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {isTextarea ? (
            <Textarea
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="bg-gray-900/50 border-purple-500/30 text-white placeholder-gray-400 min-h-[120px] text-lg p-4 focus:border-purple-400 focus:ring-purple-400"
              autoFocus
            />
          ) : (
            <Input
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-gray-900/50 border-purple-500/30 text-white placeholder-gray-400 text-lg h-14 px-4 focus:border-purple-400 focus:ring-purple-400"
              autoFocus
            />
          )}

          {hint && (
            <p className="text-gray-400 text-sm italic">
              💡 {hint}
            </p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: canProceed ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-12 text-lg rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ConversationStep;
