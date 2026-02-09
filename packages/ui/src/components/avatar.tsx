import * as React from "react";
import {
  Facehash,
  type FacehashProps,
} from "facehash";

import { cn } from "@shared/lib/utils";

type AvatarProps = FacehashProps & {
  className?: string;
};

const COLOR_PALETTE = [
  "#e9b353",
  "#d4a373",
  "#faedcd",
  "#ccd5ae",
  "#e9c46a",
  "#f4a261",
];

function getAnimationAndColors(name: string): {
  enableBlink: boolean;
  colors: [string, string];
} {
  const hash = name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) ?? 0;
  const seed = hash % 100;

  return {
    enableBlink: true,
    colors: [COLOR_PALETTE[hash % COLOR_PALETTE.length], COLOR_PALETTE[(hash + 1) % COLOR_PALETTE.length]],
  };
}

const Avatar = React.forwardRef<React.ElementRef<typeof Facehash>, AvatarProps>(
  ({ className, name, size = 40, variant = "solid", colors, ...props }, ref) => {
    const { enableBlink, colors: assignedColors } = getAnimationAndColors(name || "default");
    
    return (
      <Facehash
        ref={ref as never}
        name={name}
        size={size}
        variant={variant}
        colors={assignedColors}
        enableBlink={enableBlink}
        interactive={false}
        intensity3d="dramatic"
        className={cn("squircle", className)}
        style={{
          borderRadius: "22%",
          boxShadow: "0 4px 12px rgba(233, 179, 83, 0.4)",
        }}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Facehash>,
  React.ComponentPropsWithoutRef<typeof Facehash>
>(({ className, name, ...props }, ref) => {
  const { enableBlink, colors } = getAnimationAndColors(name || "default");
  
  return (
    <Facehash
      ref={ref as never}
      name={name}
      className={cn("squircle", className)}
      style={{
        borderRadius: "22%",
        boxShadow: "0 4px 12px rgba(233, 179, 83, 0.4)",
      }}
      enableBlink={enableBlink}
      interactive={false}
      intensity3d="dramatic"
      colors={colors}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof Facehash>,
  React.ComponentPropsWithoutRef<typeof Facehash>
>(({ className, name, ...props }, ref) => {
  const { enableBlink, colors } = getAnimationAndColors(name || "");
  
  return (
    <Facehash
      ref={ref as never}
      name={name || ""}
      className={cn("squircle", className)}
      style={{
        borderRadius: "22%",
        boxShadow: "0 4px 12px rgba(233, 179, 83, 0.4)",
      }}
      variant="solid"
      colors={colors}
      enableBlink={enableBlink}
      interactive={false}
      intensity3d="dramatic"
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
