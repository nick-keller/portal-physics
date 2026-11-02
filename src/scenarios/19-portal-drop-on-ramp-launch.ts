import type { ScenarioDefinition } from "@/engine/scenario"

/** Gravity, in world units (metres, the cube is 1 m wide) per second squared. */
const G = 9.81
const HALF = 0.5
const FLOOR = 0
const SQRT2 = Math.SQRT2

// Rectangular platform on the left, the cube resting on top of it.
const PLATFORM = { left: -5, right: -3, top: 1.5 }
const CUBE_X = (PLATFORM.left + PLATFORM.right) / 2

// Triangular ramp on the right: vertical wall on the left, 45° slope facing right.
const RAMP = { left: 2, size: 2 }
const ORANGE = { x: RAMP.left + RAMP.size / 2, y: FLOOR + RAMP.size / 2 } // middle of the slope

const START = 6 // blue portal height when the scene starts
const SPEED = 8 // how fast the blue portal comes down
const LAND = (START - PLATFORM.top) / SPEED // blue portal touches the platform, cube fully out

/**
 * Once out, gravity (0, −g) seen in the orange portal's frame (turned 45°)
 * pulls equally against both folded axes: −g/√2 along x and along y.
 */
const A = G / SQRT2

// Stop while the lowest corner of the cube (turned 45°) is still `MARGIN` above the floor.
// World height of the centre: y₀ + (v/√2)·τ − ½·g·τ², with y₀ the centre right out of the portal.
const MARGIN = 0.2
const Y0 = ORANGE.y + HALF / SQRT2
const STOP_Y = FLOOR + SQRT2 / 2 + MARGIN
const VY = SPEED / SQRT2
const FLIGHT = (VY + Math.sqrt(VY * VY + 2 * G * (Y0 - STOP_Y))) / G
const END = LAND + FLIGHT

/**
 * The cube rests on a platform; the blue portal, facing down, comes down over
 * it until it touches the platform. The orange portal lies on a 45° ramp,
 * facing up and to the right.
 *
 * Folded x on the blue side is ½ − (distance from the portal down to the
 * platform), as in scenario 11. Once fully out, the cube keeps the speed it
 * had in the portal frame (scenario 13), and gravity takes over. In the
 * orange frame both folded axes lose g/√2 per second:
 *   x = ½ + v·τ − ½·(g/√2)·τ²,  y = −½·(g/√2)·τ²
 * Both are quadratics, so a bezier with the right end slopes is exactly the
 * parabola. The scene stops before the cube reaches the floor, to avoid
 * having to deal with a tumbling cube.
 *
 * Folded angle −90° keeps the cube upright on the blue side, and lines its
 * face up with the slope on the orange side.
 */
export const portalDropOnRampLaunch: ScenarioDefinition = {
  slug: "portal-drop-on-ramp-launch",
  title: "Shot off a ramp",
  description:
    "The orange portal now sits on a 45° slope. The cube comes out at the speed of the blue portal, along the direction the orange portal faces, so it is shot up and to the right, and gravity bends its path into a parabola.",
  concepts: ["Moving portal", "Reference frame", "Gravity", "Parabola"],
  loop: false,
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: HALF - (START - PLATFORM.top), y: 0, angle: -90, interpolation: "linear" },
      { t: LAND, x: HALF, y: 0, angle: -90, slopeOut: { x: SPEED, y: 0, angle: 0 } },
      {
        t: END,
        x: HALF + SPEED * FLIGHT - (A * FLIGHT * FLIGHT) / 2,
        y: -(A * FLIGHT * FLIGHT) / 2,
        angle: -90,
        slopeIn: { x: SPEED - A * FLIGHT, y: -A * FLIGHT, angle: 0 },
      },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "y", "vx", "vy"] }],
  reference: { label: "P", portals: true },
  view: { min: { x: -6, y: -0.8 }, max: { x: 11.5, y: 7 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      kind: "solid",
      points: [
        { x: PLATFORM.left, y: FLOOR },
        { x: PLATFORM.left, y: PLATFORM.top },
        { x: PLATFORM.right, y: PLATFORM.top },
        { x: PLATFORM.right, y: FLOOR },
      ],
    },
    {
      kind: "solid",
      points: [
        { x: RAMP.left, y: FLOOR },
        { x: RAMP.left, y: FLOOR + RAMP.size },
        { x: RAMP.left + RAMP.size, y: FLOOR },
      ],
    },
    {
      kind: "portal",
      position: { x: CUBE_X, y: START },
      height: 1.8,
      color: "blue",
      facing: "down",
      path: [
        { t: 0, x: CUBE_X, y: START, interpolation: "linear" },
        { t: LAND, x: CUBE_X, y: PLATFORM.top, interpolation: "linear" },
        { t: END, x: CUBE_X, y: PLATFORM.top },
      ],
    },
    { kind: "portal", position: ORANGE, height: 1.8, color: "orange", facing: "up-right" },
  ],
}
