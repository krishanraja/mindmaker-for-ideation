import React from 'react';
import { motion } from 'framer-motion';
import { Check, Brain, MessageSquare, Rocket, Lightbulb } from 'lucide-react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, title: 'Vision Input', icon: Lightbulb, description: 'Share your idea' },
  { id: 2, title: 'AI Analysis', icon: Brain, description: 'AI processes your concept' },
  { id: 3, title: 'Smart Q&A', icon: MessageSquare, description: 'Clarify details' },
  { id: 4, title: 'Blueprint Generation', icon: Rocket, description: 'Create your roadmap' },
];

const ModernProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 w-full h-0.5 bg-border"></div>
        <div 
          className="absolute top-8 left-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const Icon = step.icon;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center relative"
              >
                {/* Step Circle */}
                <motion.div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${isCurrent 
                      ? 'bg-gradient-to-br from-primary to-primary-glow border-primary text-primary-foreground shadow-glow' 
                      : isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'bg-card border-border text-muted-foreground'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </motion.div>

                {/* Step Content */}
                <div className="mt-4 text-center max-w-32">
                  <h3 className={`font-medium text-sm ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>

                {/* Current Step Glow */}
                {isCurrent && (
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full blur-xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModernProgressTracker;