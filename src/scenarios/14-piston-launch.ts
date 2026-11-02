import type { ScenarioDefinition } from "@/engine/scenario"

/** Gravity, in world units (metres, the cube is 1 m wide) per second squared. */
const G = 9.81
const FLOOR = 0
const HALF = 0.5

const STROKE = 2 // how far the piston pushes up
const PUSH = 1 // piston starts pushing
const SPEED = 8 // piston speed when it reaches the end of its stroke
const RISE = (2 * STROKE) / SPEED // constant acceleration from rest: d = ½·v·t
const LAUNCH = PUSH + RISE // piston stops, cube leaves it
const FLIGHT = (2 * SPEED) / G // up and back down to the same height, from v = v₀ − g·t
const IMPACT = LAUNCH + FLIGHT
const END = IMPACT + 1.5

const REST = FLOOR + HALF // cube centre resting on the retracted piston
const TOP = REST + STROKE // cube centre resting on the extended piston

/**
 * A piston under the cube accelerates it up, then stops dead at the end of its
 * stroke. Nothing holds the cube down, so it keeps the speed it had and flies
 * off, until gravity brings it back onto the piston.
 *
 * The push is a bezier from slope 0 to +v: with those end slopes a cubic is
 * exactly the constant-acceleration parabola. The piston has the same curve
 * but a broken tangent at the top (+v in, 0 out), while the cube keeps +v and
 * follows the free-flight parabola, leaving at +v and arriving at −v, where a
 * second broken tangent stops it on the piston.
 */
export const pistonLaunch: ScenarioDefinition = {
  slug: "piston-launch",
  title: "The piston stops, the cube does not",
  description:
    "A piston under the cube pushes it up and stops dead after 2 units. The cube was moving with it, and nothing is holding it down, so it keeps going: it leaves the piston at full speed, gravity slows it, pulls it back down, and it lands on the piston again, where it stops. The speed jumps only when the cube hits something.",
  concepts: ["Piston", "Launch", "Gravity", "Impact"],
  loop: false,
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: 0, y: REST, interpolation: "linear" },
      { t: PUSH, x: 0, y: REST, slopeOut: { y: 0 } },
      { t: LAUNCH, x: 0, y: TOP, slopeIn: { y: SPEED }, slopeOut: { y: SPEED } },
      { t: IMPACT, x: 0, y: TOP, slopeIn: { y: -SPEED }, interpolation: "linear" },
      { t: END, x: 0, y: TOP },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["y", "vy"] }],
  reference: { label: "O", position: { x: 0, y: FLOOR } },
  view: { min: { x: -3.5, y: -0.8 }, max: { x: 3.5, y: 6.8 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      kind: "piston",
      position: { x: 0, y: FLOOR },
      width: 1.2,
      extension: [
        { t: 0, value: 0, interpolation: "linear" },
        { t: PUSH, value: 0, slopeOut: 0 },
        { t: LAUNCH, value: STROKE, slopeIn: SPEED, slopeOut: 0, interpolation: "linear" },
        { t: END, value: STROKE },
      ],
    },
  ],
}
