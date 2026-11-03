export { cn } from "cn"

/** `toFixed`, but never "-0.00": tiny negative rounding errors show as plain zero. */
export function formatNumber(v: number, digits = 2) {
  const s = v.toFixed(digits)
  return s === `-${(0).toFixed(digits)}` ? (0).toFixed(digits) : s
}
