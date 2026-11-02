/**
 * Keyframed animation curves (one scalar channel each), evaluated the way
 * graph editors do it: each segment between two keyframes is a cubic Bezier
 * in (time, value) space whose handles are derived from the tangent mode.
 *
 * Handles sit at 1/3 of the segment duration, which makes time linear in the
 * Bezier parameter, so the segment reduces to a cubic Hermite spline and can be
 * evaluated in closed form (no root finding).
 */

export type Interpolation =
  /** Cubic Bezier with automatic handles (see `TangentMode`). */
  | "bezier"
  /** Straight line to the next keyframe. */
  | "linear"
  /** Hold the value until the next keyframe. */
  | "constant"

export type TangentMode =
  /** Catmull-Rom style slope through neighbours. Smooth, may overshoot. */
  | "auto"
  /** Like `auto`, but flattened at local extrema and clamped so it never overshoots. */
  | "auto-clamped"
  /** Zero slope: ease-in / ease-out at this key. */
  | "flat"

export type Keyframe = {
  /** Time in seconds. */
  t: number
  value: number
  /** Interpolation used for the segment that *starts* at this key. Default `bezier`. */
  interpolation?: Interpolation
  /** Default `auto-clamped`. */
  tangent?: TangentMode
  /**
   * Explicit slope (value / second) arriving at / leaving this key, overriding
   * `tangent`. Different in and out slopes make a "broken" tangent: the curve
   * stays continuous but its rate of change jumps (e.g. an impact).
   */
  slopeIn?: number
  slopeOut?: number
}

export type CurveOptions = {
  /**
   * When true, the curve is treated as periodic over [first.t, last.t]
   * (tangents at the ends look at the keys on the other side).
   * The first and last values should match for a seamless loop.
   */
  loop?: boolean
}

export type Curve = {
  keys: Keyframe[]
  /** Slope (value / second) arriving at each key, resolved from its tangent mode. */
  slopesIn: number[]
  /** Slope (value / second) leaving each key. */
  slopesOut: number[]
  loop: boolean
  start: number
  end: number
}

export function createCurve(keys: Keyframe[], options: CurveOptions = {}): Curve {
  if (keys.length === 0) throw new Error("A curve needs at least one keyframe")
  const sorted = [...keys].sort((a, b) => a.t - b.t)
  const loop = options.loop ?? false
  const auto = sorted.map((_, i) => resolveSlope(sorted, i, loop))
  return {
    keys: sorted,
    slopesIn: sorted.map((k, i) => k.slopeIn ?? auto[i]),
    slopesOut: sorted.map((k, i) => k.slopeOut ?? auto[i]),
    loop,
    start: sorted[0].t,
    end: sorted[sorted.length - 1].t,
  }
}

/** Shorthand for a curve holding a single value. */
export const constantCurve = (value: number) => createCurve([{ t: 0, value }])

function neighbours(keys: Keyframe[], i: number, loop: boolean) {
  const n = keys.length
  const period = keys[n - 1].t - keys[0].t
  let prev: Keyframe | undefined = keys[i - 1]
  let next: Keyframe | undefined = keys[i + 1]
  // On a loop the first and last keys are the same instant, so skip over the
  // duplicate and shift the borrowed neighbour by one period.
  if (loop && n > 2) {
    if (!prev) prev = { ...keys[n - 2], t: keys[n - 2].t - period }
    if (!next) next = { ...keys[1], t: keys[1].t + period }
  }
  return { prev, next }
}

function resolveSlope(keys: Keyframe[], i: number, loop: boolean): number {
  const key = keys[i]
  const mode = key.tangent ?? "auto-clamped"
  if (mode === "flat") return 0

  const { prev, next } = neighbours(keys, i, loop)
  if (!prev && !next) return 0
  if (!prev) return mode === "auto" ? (next!.value - key.value) / (next!.t - key.t) : 0
  if (!next) return mode === "auto" ? (key.value - prev.value) / (key.t - prev.t) : 0

  const slope = (next.value - prev.value) / (next.t - prev.t)
  if (mode === "auto") return slope

  // auto-clamped: flat at local extrema / plateaus, and limited so the Hermite
  // segment stays monotone on both sides (Fritsch–Carlson condition).
  const dPrev = (key.value - prev.value) / (key.t - prev.t)
  const dNext = (next.value - key.value) / (next.t - key.t)
  if (dPrev === 0 || dNext === 0 || Math.sign(dPrev) !== Math.sign(dNext)) return 0
  const limit = 3 * Math.min(Math.abs(dPrev), Math.abs(dNext))
  return Math.sign(slope) * Math.min(Math.abs(slope), limit)
}

/** Wrap or clamp a time into the curve's domain. */
function normalizeTime(curve: Curve, t: number) {
  const { start, end, loop } = curve
  if (end <= start) return start
  if (loop) {
    const period = end - start
    return start + (((t - start) % period) + period) % period
  }
  return Math.min(end, Math.max(start, t))
}

export function evaluateCurve(curve: Curve, time: number): number {
  const { keys, slopesIn, slopesOut } = curve
  if (keys.length === 1) return keys[0].value

  const t = normalizeTime(curve, time)
  // Binary search for the segment [i, i+1] containing t.
  let lo = 0
  let hi = keys.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (keys[mid].t <= t) lo = mid
    else hi = mid
  }
  const a = keys[lo]
  const b = keys[hi]
  const dt = b.t - a.t
  if (dt <= 0) return b.value
  const u = (t - a.t) / dt

  switch (a.interpolation ?? "bezier") {
    case "constant":
      return u >= 1 ? b.value : a.value
    case "linear":
      return a.value + (b.value - a.value) * u
    case "bezier": {
      // Bezier control values with handles at 1/3 of the segment.
      const p0 = a.value
      const p1 = a.value + (slopesOut[lo] * dt) / 3
      const p2 = b.value - (slopesIn[hi] * dt) / 3
      const p3 = b.value
      const v = 1 - u
      return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3
    }
  }
}
