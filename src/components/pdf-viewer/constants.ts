/**
 * PDF constants for zoom and scale
 */

export const MIN_SCALE = 0.75;
export const MAX_SCALE = 2.5;
export const SCALE_STEP = 0.2;

export const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
