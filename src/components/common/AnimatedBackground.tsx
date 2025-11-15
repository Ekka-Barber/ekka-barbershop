import React from "react";
import { motion } from "@/lib/motion";
import { BACKGROUND_ANIMATIONS, ANIMATION_PERFORMANCE } from "@/constants/animations";

interface AnimatedBackgroundProps {
  prefersReducedMotion: boolean;
}

/**
 * Animated background component with gradient orbs and effects
 * Respects user motion preferences for accessibility
 */
export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  prefersReducedMotion
}) => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Animated gradient orbs - disabled if user prefers reduced motion */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-[#D6B35A]/25 via-[#C79A2A]/20 to-transparent blur-[180px]"
        style={{
          willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : ANIMATION_PERFORMANCE.WILL_CHANGE.TRANSFORM_OPACITY,
          backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY,
          transform: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.TRANSFORM_Z
        }}
        animate={prefersReducedMotion ? {} : {
          scale: BACKGROUND_ANIMATIONS.ORB_1.scale,
          opacity: BACKGROUND_ANIMATIONS.ORB_1.opacity
        }}
        transition={{
          duration: BACKGROUND_ANIMATIONS.ORB_1.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: BACKGROUND_ANIMATIONS.ORB_1.delay
        }}
      />
      <motion.div
        className="absolute top-1/3 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#2a2a2a]/30 via-[#1a1a1a]/25 to-transparent blur-[150px]"
        style={{
          willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : ANIMATION_PERFORMANCE.WILL_CHANGE.TRANSFORM_OPACITY,
          backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY,
          transform: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.TRANSFORM_Z
        }}
        animate={prefersReducedMotion ? {} : {
          scale: BACKGROUND_ANIMATIONS.ORB_2.scale,
          opacity: BACKGROUND_ANIMATIONS.ORB_2.opacity
        }}
        transition={{
          duration: BACKGROUND_ANIMATIONS.ORB_2.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: BACKGROUND_ANIMATIONS.ORB_2.delay
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#3a3a3a]/20 via-transparent to-transparent blur-[120px]"
        style={{
          willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : ANIMATION_PERFORMANCE.WILL_CHANGE.TRANSFORM_OPACITY,
          backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY,
          transform: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.TRANSFORM_Z
        }}
        animate={prefersReducedMotion ? {} : {
          scale: BACKGROUND_ANIMATIONS.ORB_3.scale,
          opacity: BACKGROUND_ANIMATIONS.ORB_3.opacity
        }}
        transition={{
          duration: BACKGROUND_ANIMATIONS.ORB_3.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: BACKGROUND_ANIMATIONS.ORB_3.delay
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Ambient light rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(214,179,90,0.12),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(50,50,50,0.18),_transparent_60%)]" />
    </div>
  );
};
