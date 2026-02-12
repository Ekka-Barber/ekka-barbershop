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