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
      {/* Animated gradient orbs - disabled on mobile and if user prefers reduced motion */}
      {/* Hidden on mobile (< 768px) for better performance */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[900px] w-[900px] rounded-full bg-gradient-to-br from-[#E8C66F]/30 via-[#D6B35A]/25 to-[#C79A2A]/15 blur-[80px] hidden md:block"
        style={{
          willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : 'transform',
          backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY,
          transform: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.TRANSFORM_Z
        }}
        animate={prefersReducedMotion ? {} : {
          scale: BACKGROUND_ANIMATIONS.ORB_1.scale
        }}
        transition={{
          duration: BACKGROUND_ANIMATIONS.ORB_1.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: BACKGROUND_ANIMATIONS.ORB_1.delay
        }}
      />
      <motion.div
        className="absolute top-1/3 -right-1/4 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-[#3a3a3a]/40 via-[#2a2a2a]/30 to-transparent blur-[70px] hidden md:block"
        style={{
          willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : 'transform',
          backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY,
          transform: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.TRANSFORM_Z
        }}
        animate={prefersReducedMotion ? {} : {
          scale: BACKGROUND_ANIMATIONS.ORB_2.scale
        }}
        transition={{
          duration: BACKGROUND_ANIMATIONS.ORB_2.duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: BACKGROUND_ANIMATIONS.ORB_2.delay
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#4a4a4a]/25 via-[#3a3a3a]/15 to-transparent blur-[60px] hidden md:block"
        style={{
          willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : 'transform',
          backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY,
          transform: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.TRANSFORM_Z
        }}
        animate={prefersReducedMotion ? {} : {
          scale: BACKGROUND_ANIMATIONS.ORB_3.scale
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
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Ambient light rays - enhanced */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(232,198,111,0.16),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(60,60,60,0.22),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(20,20,20,0.3)_100%)]" />
    </div>
  );
};
