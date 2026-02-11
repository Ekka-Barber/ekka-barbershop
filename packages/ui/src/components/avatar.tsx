import {
  Facehash,
  type FacehashProps,
} from "facehash";
import * as React from "react";

import { cn } from "@shared/lib/utils";

import { getColorsFromName } from "./avatar-utils";

type AvatarProps = FacehashProps & {
  className?: string;
  children?: React.ReactNode;
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

  return {
    enableBlink: true,
    colors: [COLOR_PALETTE[hash % COLOR_PALETTE.length], COLOR_PALETTE[(hash + 1) % COLOR_PALETTE.length]],
  };
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, size = 40, variant = "solid", colors: _colors, children, ...props }, ref) => {
    // If children are provided, render a container div (for AvatarImage/AvatarFallback pattern)
    if (children) {
      const hasWidthClass = className && /\bw-/.test(className);
      const hasHeightClass = className && /\bh-/.test(className);
      const style: React.CSSProperties = {};
      if (!hasWidthClass) style.width = size;
      if (!hasHeightClass) style.height = size;
      
      return (
        <div
          ref={ref}
          className={cn(
            "relative flex shrink-0 overflow-hidden rounded-[22%]",
            className
          )}
          style={Object.keys(style).length > 0 ? style : undefined}
          {...props}
        >
          {children}
        </div>
      );
    }
    
    // Otherwise, render Facehash (for Google reviews, etc.)
    const { enableBlink, colors: assignedColors } = getAnimationAndColors(name || "default");
    
    return (
      <Facehash
        ref={ref as never}
        name={name || ""}
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

interface AvatarImageProps extends Omit<React.ComponentPropsWithoutRef<typeof Facehash>, 'name'> {
  src?: string;
  alt?: string;
  name?: string;
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof Facehash>,
  AvatarImageProps
>(({ className, name, src, alt, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    setHasError(false);
  }, [src]);
  
  if (!src || src.trim() === '' || hasError) {
    return null;
  }
  
  return (
    <img
      ref={ref as React.Ref<HTMLImageElement>}
      src={src}
      alt={alt || name || ""}
      className={cn(
        "absolute inset-0 h-full w-full object-cover rounded-[22%] border border-[#e5cc9e] z-10",
        className
      )}
      style={{
        boxShadow: "0 4px 12px rgba(233, 179, 83, 0.4)",
      }}
      onError={() => setHasError(true)}
      onLoad={() => setHasError(false)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends Omit<React.ComponentPropsWithoutRef<typeof Facehash>, 'name'> {
  name?: string;
  children?: React.ReactNode;
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof Facehash>,
  AvatarFallbackProps
>(({ className, name, children, ...props }, ref) => {
  // If children provided, render custom fallback
  if (children) {
    const colors = getColorsFromName(name || "");
    const hasBackgroundClass = className && /bg-/.test(className);
    const style = {
      boxShadow: "0 4px 12px rgba(233, 179, 83, 0.4)",
      border: "1px solid #e5cc9e",
      ...(!hasBackgroundClass && { background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }),
    };
    
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          "absolute inset-0 h-full w-full flex items-center justify-center rounded-[22%] z-0",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  // Otherwise, use Facehash (for backward compatibility)
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
