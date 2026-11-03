import type { ScenarioDefinition } from "@/engine/scenario"
import { portalDropOnCube } from "./11-portal-drop-on-cube"
import { portalDropOnCubeFrames } from "./12-portal-drop-on-cube-frames"

/** Gravity, in world units (metres, the cube is 1 m wide) per second squared. */
const G = 9.81
const HALF = 0.5

const START = 6 // blue portal height when the scene starts (see scenario 11)
const SPEED = 8 // how fast the blue portal comes down
const LAND = START / SPEED // blue portal touches the floor, cube fully out
const FLIGHT = (2 * SPEED) / G // up and back down to the floor, from v = v₀ − g·t
const IMPACT = LAND + FLIGHT
const END = IMPACT + 1.5

/**
 * Same scene and reference as the previous scenario, but the cube keeps the
 * speed it had in the portal frame when it comes out of the orange portal.
 *
 * Folded x on the orange side is the height of the centre above the floor.
 * Once out, gravity takes over: x = ½ + v₀·τ − ½·g·τ². The flight is a bezier
 * leaving at +v₀ and arriving at −v₀, which is exactly that parabola, and the
 * broken tangent at impact makes the speed drop to zero there.
 */
export const portalDropOnCubeLaunchCopy: ScenarioDefinition = {
  ...portalDropOnCubeFrames,
  slug: "portal-drop-on-cube-launch-copy",
  title: "It was never about the piston",
  description:
    "If we make the piston even smaller it should still work. We can make it so small that it is basically 0, we would have the same result: it was never about the piston.",
  concepts: ["Moving portal", "Reference frame", "Gravity", "Continuous speed"],
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: HALF - START, y: 0, angle: -90, interpolation: "linear" },
      { t: LAND, x: HALF, y: 0, angle: -90, slopeOut: { x: SPEED, y: 0, angle: 0 } },
      { t: IMPACT, x: HALF, y: 0, angle: -90, slopeIn: { x: -SPEED, y: 0, angle: 0 }, interpolation: "linear" },
      { t: END, x: HALF, y: 0, angle: -90 },
    ],
  },
  props: portalDropOnCube.props?.map((p) =>
    p.kind === "portal" && p.path
      ? { ...p, path: [...p.path.slice(0, -1), { ...p.path[p.path.length - 1], t: END }] }
      : p,
  ),
}
