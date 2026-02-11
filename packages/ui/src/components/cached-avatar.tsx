import { cn } from "@shared/lib/utils";
import { Avatar } from "@shared/ui/components/avatar";

interface CachedAvatarProps {
  authorName?: string;
  className?: string;
  size?: number;
}

const COLOR_PALETTE = [
  "#e9b353",
  "#d4a373",
  "#faedcd",
  "#ccd5ae",
  "#e9c46a",
  "#f4a261",
];

export function CachedAvatar({
  authorName,
  className,
  size = 40,
}: CachedAvatarProps) {
  const hash = authorName?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) ?? 0;
  const colors = [COLOR_PALETTE[hash % COLOR_PALETTE.length], COLOR_PALETTE[(hash + 1) % COLOR_PALETTE.length]];

  return (
    <div className={cn("overflow-hidden squircle", className)} style={{ width: size, height: size, borderRadius: "22%" }}>
      <Avatar
        name={authorName || ""}
        size={size}
        colors={colors}
      />
    </div>
  );
}
