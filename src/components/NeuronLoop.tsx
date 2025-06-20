
import React from 'react';
import { motion } from 'framer-motion';

const NeuronLoop: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg width="400" height="300" viewBox="0 0 400 300" className="opacity-20">
        {/* Neuron nodes */}
        <motion.circle
          cx="100"
          cy="150"
          r="8"
          fill="#6C40FF"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.circle
          cx="200"
          cy="100"
          r="6"
          fill="#8F6CFF"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />
        
        <motion.circle
          cx="300"
          cy="150"
          r="10"
          fill="#6C40FF"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7
          }}
        />
        
        {/* Briefcase representation */}
        <motion.rect
          x="190"
          y="190"
          width="20"
          height="15"
          rx="2"
          fill="#8F6CFF"
          animate={{
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Connecting lines */}
        <motion.path
          d="M 108 150 Q 150 125 192 105"
          stroke="#6C40FF"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          animate={{
            strokeDashoffset: [0, -10]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.path
          d="M 208 105 Q 250 125 292 145"
          stroke="#8F6CFF"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          animate={{
            strokeDashoffset: [0, -10]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: 0.3
          }}
        />
        
        <motion.path
          d="M 295 160 Q 250 175 210 185"
          stroke="#6C40FF"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          animate={{
            strokeDashoffset: [0, -10]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: 0.6
          }}
        />
      </svg>
    </div>
  );
};

export default NeuronLoop;
