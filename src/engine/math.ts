export type Vec2 = { x: number; y: number }

export const vec = (x: number, y: number): Vec2 => ({ x, y })
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s })

export const rotate = (v: Vec2, angle: number): Vec2 => {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }
}

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

export const degToRad = (deg: number) => (deg * Math.PI) / 180
export const radToDeg = (rad: number) => (rad * 180) / Math.PI

/** A rigid transform: rotate by `angle` (radians, CCW) then translate by `position`. */
export type Pose = { position: Vec2; angle: number }

/** Map a point expressed in a body's local frame into world coordinates. */
export const localToWorld = (pose: Pose, local: Vec2): Vec2 =>
  add(pose.position, rotate(local, pose.angle))

/** Map a world point into a body's local frame (inverse of `localToWorld`). */
export const worldToLocal = (pose: Pose, world: Vec2): Vec2 => rotate(sub(world, pose.position), -pose.angle)
