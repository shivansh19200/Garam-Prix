import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface WindRevealProps {
  children: React.ReactNode;
  direction?: 'wind-left' | 'wind-right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  distance?: number;
}

export const WindReveal: React.FC<WindRevealProps> = ({
  children,
  direction = 'wind-left',
  delay = 0,
  duration = 0.75,
  className = '',
  distance = 36,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialOffsets = () => {
    switch (direction) {
      case 'wind-left':
        return { x: -distance, y: 12, skewX: -3 };
      case 'wind-right':
        return { x: distance, y: 12, skewX: 3 };
      case 'up':
        return { x: 0, y: distance, skewX: 0 };
      case 'down':
        return { x: 0, y: -distance, skewX: 0 };
      default:
        return { x: -distance, y: 10, skewX: -2 };
    }
  };

  const offsets = getInitialOffsets();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: offsets.x,
        y: offsets.y,
        skewX: offsets.skewX,
        filter: 'blur(8px)',
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        skewX: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // luxury deceleration curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
