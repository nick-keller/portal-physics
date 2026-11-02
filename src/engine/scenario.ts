import { createCurve, evaluateCurve, type Curve, type Keyframe } from "./curve"
import { localToWorld, worldToLocal, type Pose, type Vec2 } from "./math"

/** A point rigidly attached to the cube, expressed in the cube's local frame (cube size = 1). */
export type TrackedPoint = {
  id: string
  label: string
  /** Local coordinates, in units of cube size. (0,0) is the centre, (0.5, 0.5) the top-right corner. */
  local: Vec2
  /** Quantities to show in the graphs and scene, in display order. Default: `["x", "y"]`. */
  series?: Series[]
}

export type Axis = "x" | "y"
/** Position components (`x`, `y`) and velocity components (`vx`, `vy`), relative to the reference point. */
export type Series = Axis | "vx" | "vy"

export const trackedSeries = (point: TrackedPoint): Series[] => point.series ?? ["x", "y"]

type PoseChannel = "x" | "y" | "angle"

/** A pose keyframe: position (world units) and optional angle (degrees, CCW). */
export type PoseKeyframe = Omit<Keyframe, "value" | "slopeIn" | "slopeOut"> & {
  x: number
  y: number
  angle?: number
  /** Explicit per-channel slopes (units/s, or degrees/s for angle); see `Keyframe.slopeIn`. */
  slopeIn?: Partial<Record<PoseChannel, number>>
  slopeOut?: Partial<Record<PoseChannel, number>>
}

/** Something drawn in the world besides the cube. */
export type SceneProp =
  /** Solid ground whose top surface is at `y`. */
  | { kind: "floor"; y: number; from: number; to: number }
  /** A fixed solid block (platform, ramp…): a closed polygon, world coordinates. */
  | { kind: "solid"; points: Vec2[] }
  /**
   * Two hinged doors meeting at `position` (centre of their top surface).
   * `open` animates the door angle in degrees: 0 = closed, 90 = hanging down.
   */
  | { kind: "trapdoor"; position: Vec2; width: number; open: Keyframe[] }
  /**
   * A piston sunk into the floor. `position` is the centre of its head's top
   * surface when retracted (flush with the floor), `width` the head's width.
   * `extension` animates how far the head is raised, in world units.
   * `showBase: false` hides everything below `position` (recess, lower rod),
   * e.g. when the piston comes out of a portal.
   * `cutAbove`, if given, animates a world height above which nothing of the
   * piston is drawn, e.g. when a portal comes down over it and swallows it.
   */
  | {
      kind: "piston"
      position: Vec2
      width: number
      extension: Keyframe[]
      showBase?: boolean
      cutAbove?: Keyframe[]
    }
  /**
   * A portal seen edge-on. `position` is the centre of its surface, `height`
   * its length along the surface; `facing` is the way its opening looks.
   * `path`, if given, animates `position` over time (keyframe angles are ignored).
   */
  | {
      kind: "portal"
      position: Vec2
      height: number
      color: "blue" | "orange"
      facing: Facing
      path?: PoseKeyframe[]
    }

export type Facing = "left" | "right" | "up" | "down" | "up-right" | "up-left"

/** Direction of each facing, as an angle in radians (CCW from +x). */
export const FACING_ANGLE: Record<Facing, number> = {
  right: 0,
  up: Math.PI / 2,
  left: Math.PI,
  down: -Math.PI / 2,
  "up-right": Math.PI / 4,
  "up-left": (3 * Math.PI) / 4,
}

export type ScenarioDefinition = {
  slug: string
  title: string
  /** Short explanation of the concept the scenario introduces. */
  description: string
  /** Concepts introduced, shown as tags. */
  concepts: string[]
  loop: boolean
  cube: {
    size: number
    keyframes: PoseKeyframe[]
  }
  trackedPoints: TrackedPoint[]
  /**
   * What the tracked coordinates are measured from: either a fixed world point
   * (axes along the world's), or the portals: the frame attached to and lined
   * up with the blue portal while the point is on the blue side, with the
   * orange one on the orange side (see `referenceFrame`).
   */
  reference: { label: string } & ({ position: Vec2 } | { portals: true })
  /** World-space region the camera should frame. */
  view: { min: Vec2; max: Vec2 }
  /**
   * Things drawn in the world. A blue and an orange portal together form a
   * linked pair the cube travels through. Keyframes are then authored in
   * "folded" space, as if the blue portal faced left and the orange one faced
   * right, back to back at the origin, so that going through is just moving on
   * along x. The half x < 0 is laid out in the world behind the blue portal,
   * the half x ≥ 0 in front of the orange one, rotated to match its facing.
   */
  props?: SceneProp[]
}

/** A portal's placement over time: fixed angle, position animated by curves. */
export type PortalAnchor = { angle: number; x: Curve; y: Curve }

export type Scenario = ScenarioDefinition & {
  /** Where each half of folded space lands in the world (see `props`), if there is a portal pair. */
  portalPair?: { blue: PortalAnchor; orange: PortalAnchor }
  duration: number
  channels: { x: Curve; y: Curve; angle: Curve }
  keyTimes: number[]
}

/** One scalar curve out of pose keyframes. */
function poseChannel(
  keys: PoseKeyframe[],
  name: PoseChannel,
  pick: (k: PoseKeyframe) => number,
  options: { loop?: boolean },
  unit = 1,
): Curve {
  return createCurve(
    keys.map((k) => ({
        t: k.t,
        interpolation: k.interpolation,
        tangent: k.tangent,
        value: pick(k) * unit,
        slopeIn: k.slopeIn?.[name] === undefined ? undefined : k.slopeIn[name] * unit,
      slopeOut: k.slopeOut?.[name] === undefined ? undefined : k.slopeOut[name] * unit,
    })),
    options,
  )
}

type PortalProp = Extract<SceneProp, { kind: "portal" }>

/** Position curves of a portal prop: its `path` if animated, else constant at `position`. */
export function portalPathCurves(prop: PortalProp, loop = false): { x: Curve; y: Curve } {
  const path = prop.path?.length ? prop.path : [{ t: 0, x: prop.position.x, y: prop.position.y }]
  return {
    x: poseChannel(path, "x", (k) => k.x, { loop }),
    y: poseChannel(path, "y", (k) => k.y, { loop }),
  }
}

export function buildScenario(def: ScenarioDefinition): Scenario {
  const keys = def.cube.keyframes
  const options = { loop: def.loop }
  const x = poseChannel(keys, "x", (k) => k.x, options)
  const y = poseChannel(keys, "y", (k) => k.y, options)
  const angle = poseChannel(keys, "angle", (k) => k.angle ?? 0, options, Math.PI / 180)
  const portal = (color: "blue" | "orange") =>
    def.props?.find((p): p is PortalProp => p.kind === "portal" && p.color === color)
  const blue = portal("blue")
  const orange = portal("orange")
  // Folded space has blue facing left and orange facing right: turn each half
  // so that facing lines up with the real portal's.
  const anchor = (prop: PortalProp, angle: number): PortalAnchor => ({ angle, ...portalPathCurves(prop, def.loop) })
  const portalPair =
    blue && orange
      ? { blue: anchor(blue, FACING_ANGLE[blue.facing] - Math.PI), orange: anchor(orange, FACING_ANGLE[orange.facing]) }
      : undefined
  const portalEnds = portalPair ? [portalPair.blue, portalPair.orange].flatMap((a) => [a.x.end, a.y.end]) : []
  return {
    ...def,
    portalPair,
    duration: Math.max(x.end, y.end, angle.end, ...portalEnds),
    channels: { x, y, angle },
    keyTimes: [...new Set(keys.map((k) => k.t))].sort((a, b) => a - b),
  }
}

/**
 * Cube pose at time t in folded space (see `portalPair`). Without a portal
 * pair this is the world pose; otherwise map points with `unfold`.
 */
export function poseAt(scenario: Scenario, t: number): Pose {
  const { x, y, angle } = scenario.channels
  return {
    position: { x: evaluateCurve(x, t), y: evaluateCurve(y, t) },
    angle: evaluateCurve(angle, t),
  }
}

/** Which side of the portal pair a folded point is on: −1 = blue side, 1 = orange side. */
export const portalSide = (p: Vec2): -1 | 1 => (p.x < 0 ? -1 : 1)

const IDENTITY: Pose = { position: { x: 0, y: 0 }, angle: 0 }

/** World pose of a portal anchor at time t. */
export const anchorPose = (anchor: PortalAnchor, t: number): Pose => ({
  position: { x: evaluateCurve(anchor.x, t), y: evaluateCurve(anchor.y, t) },
  angle: anchor.angle,
})

/** Rigid transform that takes folded space to world space on the given side, at time t. */
export function portalTransform(scenario: Scenario, side: -1 | 1, t: number): Pose {
  const pair = scenario.portalPair
  if (!pair) return IDENTITY
  return anchorPose(side === -1 ? pair.blue : pair.orange, t)
}

/** Map a folded-space point (see `props`) to world space at time t. */
export function unfold(scenario: Scenario, p: Vec2, t: number): Vec2 {
  return localToWorld(portalTransform(scenario, portalSide(p), t), p)
}

/** Tracked point position in folded space (equal to world space without a portal pair). */
export function trackedFoldedPosition(scenario: Scenario, pose: Pose, point: TrackedPoint): Vec2 {
  const local = { x: point.local.x * scenario.cube.size, y: point.local.y * scenario.cube.size }
  return localToWorld(pose, local)
}

export function trackedWorldPosition(scenario: Scenario, pose: Pose, point: TrackedPoint, t: number): Vec2 {
  return unfold(scenario, trackedFoldedPosition(scenario, pose, point), t)
}

/**
 * World pose of the reference frame for a point on the given side. A portal
 * frame is that side's folded-to-world transform: its origin is on the portal
 * and its x axis points through it, the way the cube travels.
 */
export function referenceFrame(scenario: Scenario, side: -1 | 1, t: number): Pose {
  const ref = scenario.reference
  return "portals" in ref ? portalTransform(scenario, side, t) : { position: ref.position, angle: 0 }
}

/** Reference frame a tracked point is measured in at the given pose and time. */
export function trackedReferenceFrame(scenario: Scenario, pose: Pose, point: TrackedPoint, t: number): Pose {
  return referenceFrame(scenario, portalSide(trackedFoldedPosition(scenario, pose, point)), t)
}

/** Tracked point coordinates in the scenario's reference frame. */
export function trackedRelativePosition(scenario: Scenario, pose: Pose, point: TrackedPoint, t: number): Vec2 {
  return worldToLocal(trackedReferenceFrame(scenario, pose, point, t), trackedWorldPosition(scenario, pose, point, t))
}

/** Time step used to differentiate position into velocity (seconds). */
const DT = 1e-4

/**
 * Position and velocity of a tracked point at time t, relative to the reference.
 * Velocity is *computed from position*: the change in position over a tiny time
 * step, v ≈ (p(t + Δt) − p(t − Δt)) / 2Δt. Both ends of the step are placed
 * with the side of the portal pair the point is on at t, so a trip through the
 * portals does not count as motion, while a portal moving the point around does.
 */
export function trackedState(scenario: Scenario, t: number, point: TrackedPoint): Record<Series, number> {
  const pose = poseAt(scenario, t)
  const p = trackedRelativePosition(scenario, pose, point, t)
  const side = portalSide(trackedFoldedPosition(scenario, pose, point))
  const at = (time: number) => {
    const folded = trackedFoldedPosition(scenario, poseAt(scenario, time), point)
    const world = localToWorld(portalTransform(scenario, side, time), folded)
    return worldToLocal(referenceFrame(scenario, side, time), world)
  }
  // Outside a loop, stay inside the timeline at its ends (one-sided difference).
  const lo = scenario.loop ? t - DT : Math.max(0, t - DT)
  const hi = scenario.loop ? t + DT : Math.min(scenario.duration, t + DT)
  const a = at(lo)
  const b = at(hi)
  return { x: p.x, y: p.y, vx: (b.x - a.x) / (hi - lo), vy: (b.y - a.y) / (hi - lo) }
}

export type Sample = { t: number } & Record<string, number>

/**
 * Pre-sample every tracked point over the whole timeline.
 * Keys are `${pointId}.${series}`, e.g. `center.y` or `center.vy`.
 */
export function sampleScenario(scenario: Scenario, samplesPerSecond = 60): Sample[] {
  const count = Math.max(2, Math.ceil(scenario.duration * samplesPerSecond))
  // Regular samples, plus samples hugging each keyframe so that abrupt changes
  // (broken tangents) show up as vertical jumps instead of steep ramps.
  const times = new Set<number>()
  for (let i = 0; i <= count; i++) times.add((i / count) * scenario.duration)
  for (const k of [...scenario.keyTimes, ...portalCrossings(scenario)]) {
    for (const t of [k - 3 * DT, k + 3 * DT]) if (t > 0 && t < scenario.duration) times.add(t)
  }
  const samples: Sample[] = []
  for (const t of [...times].sort((a, b) => a - b)) {
    const sample: Sample = { t }
    for (const p of scenario.trackedPoints) {
      const state = trackedState(scenario, t, p)
      for (const s of trackedSeries(p)) sample[`${p.id}.${s}`] = state[s]
    }
    samples.push(sample)
  }
  return samples
}

/** Times at which any tracked point goes through the portal pair (its world position jumps). */
export function portalCrossings(scenario: Scenario): number[] {
  if (!scenario.portalPair) return []
  const steps = Math.ceil(scenario.duration * 200)
  const crossings: number[] = []
  for (const p of scenario.trackedPoints) {
    const side = (t: number) => portalSide(trackedFoldedPosition(scenario, poseAt(scenario, t), p))
    let prev = 0
    for (let i = 1; i <= steps; i++) {
      const next = (i / steps) * scenario.duration
      if (side(prev) !== side(next)) {
        // Bisect down to well below the sampling step.
        let [a, b] = [prev, next]
        while (b - a > 1e-7) {
          const m = (a + b) / 2
          if (side(m) === side(a)) a = m
          else b = m
        }
        crossings.push((a + b) / 2)
      }
      prev = next
    }
  }
  return crossings
}
