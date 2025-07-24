import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';

interface MultiSelectStepProps {
  title: string;
  subtitle: string;
  options: string[];
  selectedOptions: string[];
  onOptionsChange: (options: string[]) => void;
  additionalText: string;
  onAdditionalTextChange: (text: string) => void;
  onNext: () => void;
  canProceed: boolean;
}

const MultiSelectStep: React.FC<MultiSelectStepProps> = ({
  title,
  subtitle,
  options,
  selectedOptions,
  onOptionsChange,
  additionalText,
  onAdditionalTextChange,
  onNext,
  canProceed
}) => {
  const handleOptionToggle = (option: string) => {
    if (selectedOptions.includes(option)) {
      onOptionsChange(selectedOptions.filter(opt => opt !== option));
    } else {
      onOptionsChange([...selectedOptions, option]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="bg-gray-800/50 border-violet-500/20 p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-white mb-3">
            {title}
          </h2>
          <p className="text-gray-300 text-lg">
            {subtitle}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {options.map((option, index) => (
            <motion.div
              key={option}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-4 rounded-lg border border-gray-700/50 hover:border-violet-500/30 transition-colors cursor-pointer"
              onClick={() => handleOptionToggle(option)}
            >
              <Checkbox
                checked={selectedOptions.includes(option)}
                onCheckedChange={() => handleOptionToggle(option)}
                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
              />
              <label className="text-gray-300 cursor-pointer flex-1">
                {option}
              </label>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <label className="text-gray-300 text-sm font-medium">
            Anything else? (Optional)
          </label>
          <Textarea
            value={additionalText}
            onChange={(e) => onAdditionalTextChange(e.target.value)}
            placeholder="Tell us more about your situation..."
            className="bg-gray-900/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-violet-500/50 focus:ring-violet-500/20"
            rows={3}
          />
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white px-8 py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default MultiSelectStep;