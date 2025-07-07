
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';

interface ProgressSidebarProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, title: 'Welcome', subtitle: '' },
  { id: 2, title: 'Org Snapshot', subtitle: '' },
  { id: 3, title: 'Anxiety Pulse', subtitle: '' },
  { id: 4, title: 'Capability Map', subtitle: '' },
  { id: 5, title: 'Habit Hooks', subtitle: '' },
  { id: 6, title: 'Success North-Star', subtitle: '' },
  { id: 7, title: 'Wrap-Up', subtitle: '' }
];

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-black/95 backdrop-blur-sm border-r border-violet-500/20 p-6 z-40">
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">AI Mindset Sprint Canvas</h2>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                isCurrent 
                  ? 'bg-violet-600 text-white' 
                  : isCompleted 
                    ? 'bg-gray-900 text-gray-300' 
                    : 'bg-transparent text-gray-500'
              }`}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                isCurrent 
                  ? 'border-white bg-white' 
                  : isCompleted 
                    ? 'border-violet-400 bg-violet-400' 
                    : 'border-gray-500'
              }`}>
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <Circle className="w-3 h-3 fill-violet-600 text-violet-600" />
                ) : (
                  <span className="text-xs font-medium text-gray-500">{step.id}</span>
                )}
              </div>
              
              <div>
                <div className="font-medium">Step {step.id}</div>
                <div className="text-sm opacity-80">{step.title}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSidebar;
