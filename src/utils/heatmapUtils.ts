
import { HeatmapColors } from '@/types/heatmap';

export const HEATMAP_COLORS: HeatmapColors = {
  low: [211, 228, 253],    // Soft Blue
  medium: [14, 165, 233],  // Ocean Blue
  high: [217, 70, 239],    // Magenta Pink
  max: [139, 92, 246]      // Vivid Purple
};

export const interpolateColors = (intensity: number, colors: HeatmapColors): number[] => {
  if (intensity <= 0.33) {
    return interpolate(colors.low, colors.medium, intensity * 3);
  } else if (intensity <= 0.66) {
    return interpolate(colors.medium, colors.high, (intensity - 0.33) * 3);
  } else {
    return interpolate(colors.high, colors.max, (intensity - 0.66) * 3);
  }
};

export const interpolate = (color1: number[], color2: number[], factor: number): number[] => {
  return color1.map((c, i) => Math.round(c + (color2[i] - c) * factor));
};

export const normalizeCoordinates = (
  click: { x_coordinate: number; y_coordinate: number; scroll_x: number; scroll_y: number; content_width: number; content_height: number },
  containerWidth: number,
  containerHeight: number
) => {
  const safeContentWidth = Math.max(click.content_width, containerWidth, 100);
  const safeContentHeight = Math.max(click.content_height, containerHeight, 100);

  const normalizedX = Math.min(
    containerWidth,
    Math.max(0, ((click.x_coordinate - click.scroll_x) / safeContentWidth) * containerWidth)
  );
  const normalizedY = Math.min(
    containerHeight,
    Math.max(0, ((click.y_coordinate - click.scroll_y) / safeContentHeight) * containerHeight)
  );

  return {
    x: isFinite(normalizedX) ? normalizedX : 0,
    y: isFinite(normalizedY) ? normalizedY : 0
  };
};
