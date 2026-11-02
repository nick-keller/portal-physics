import type { ScenarioDefinition } from "@/engine/scenario"

/**
 * The cube travels around a 4×4 square: right, up, left, down, then loops.
 * Every keyframe uses bezier interpolation with auto-clamped tangents, so each
 * leg eases in and out of the corners without overshooting the square.
 * Both position components and both speed components are tracked.
 */
export const squareLoop: ScenarioDefinition = {
  slug: "square-loop",
  title: "Motion in two directions",
  description:
    "So far the cube only moved along one direction at a time. Now it travels around a square, so we track both directions at once. Its centre is measured from the world origin, so its position is two numbers, x and y, each changing over time. Its speed splits the same way: vx is how fast x changes, vy how fast y changes. Along the bottom and top edges only x changes, so vy is zero; along the sides only y changes, so vx is zero. Position and both speeds stay continuous.",
  concepts: ["Two dimensions", "Position (x, y)", "Speed (vx, vy)"],
  loop: true,
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: 0, y: 0 },
      { t: 1.5, x: 4, y: 0 },
      { t: 3, x: 4, y: 4 },
      { t: 4.5, x: 0, y: 4 },
      { t: 6, x: 0, y: 0 },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "y", "vx", "vy"] }],
  reference: { label: "O", position: { x: 0, y: 0 } },
  view: { min: { x: -1.5, y: -1.5 }, max: { x: 5.5, y: 5.5 } },
}
