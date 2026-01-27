import React from "react";

import { ENTRANCE_ANIMATIONS, ANIMATION_PERFORMANCE } from "@shared/constants/animations";
import { motion } from "@shared/lib/motion";

type AnimationType = keyof typeof ENTRANCE_ANIMATIONS;

interface AnimatedSectionProps {
  children: React.ReactNode;
  animationType: AnimationType;
  prefersReducedMotion: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable animated section wrapper for entrance animations
 * Reduces code duplication and ensures consistent animation behavior
 */
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animationType,
  prefersReducedMotion,
  className = "",
  style = {}
}) => {
  const animationConfig = ENTRANCE_ANIMATIONS[animationType];

  return (
    <motion.div
      className={className}
      style={{
        willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : ANIMATION_PERFORMANCE.WILL_CHANGE.TRANSFORM_OPACITY,
        backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY,
        ...style
      }}
      initial={prefersReducedMotion ? {} : animationConfig.initial}
      animate={prefersReducedMotion ? {} : animationConfig.animate}
      transition={{
        duration: animationConfig.duration,
        delay: 'delay' in animationConfig ? animationConfig.delay : 0,
        ease: animationConfig.ease
      }}
    >
      {children}
    </motion.div>
  );
};
