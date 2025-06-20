
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number;
  size?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size = 60 }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(108, 64, 255, 0.2)"
          strokeWidth="3"
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="3"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C40FF" />
            <stop offset="100%" stopColor="#8F6CFF" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Progress text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-sm font-semibold">
          {Math.round(progress)}%
        </span>
      </div>
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 blur-sm"
        style={{
          background: `conic-gradient(from 0deg, transparent ${100 - progress}%, #6C40FF ${100 - progress}%, #8F6CFF 100%, transparent 100%)`
        }}
      />
    </div>
  );
};

export default ProgressRing;
