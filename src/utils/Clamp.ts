export function clamp(value: number, max: number, min: number) {
  return Math.max(max, Math.min(min, value));
}
