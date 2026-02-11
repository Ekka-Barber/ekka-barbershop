const COLOR_PALETTE = [
  "#e9b353",
  "#d4a373",
  "#faedcd",
  "#ccd5ae",
  "#e9c46a",
  "#f4a261",
] as const;

export function getColorsFromName(name: string): [string, string] {
  const hash = name?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) ?? 0;
  return [COLOR_PALETTE[hash % COLOR_PALETTE.length], COLOR_PALETTE[(hash + 1) % COLOR_PALETTE.length]];
}

export function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}