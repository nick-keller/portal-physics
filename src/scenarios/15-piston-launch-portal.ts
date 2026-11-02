import type { ScenarioDefinition } from "@/engine/scenario"
import { pistonLaunch } from "./14-piston-launch"

const FLOOR = 0
const HALF = 0.5
const SIZE = 1

const DEPTH = SIZE // how far below the floor the piston head starts, so the cube is fully inside the portal
const STROKE = 2 // how far above the floor the piston pushes up
const TRAVEL = DEPTH + STROKE // total piston travel
const PUSH = 1 // piston starts pushing
const SPEED = 8 // piston speed when it reaches the end of its stroke
const RISE = (2 * TRAVEL) / SPEED // constant acceleration from rest: d = ½·v·t
const LAUNCH = PUSH + RISE // piston stops, cube leaves it
const G = 9.81
const FLIGHT = (2 * SPEED) / G // up and back down to the same height, from v = v₀ − g·t
const IMPACT = LAUNCH + FLIGHT
const END = IMPACT + 1.5

const REST = FLOOR - DEPTH + HALF // cube centre on the retracted piston, cube fully inside the portal
const TOP = FLOOR + STROKE + HALF // cube centre resting on the extended piston

/**
 * Same scene as the previous scenario, with an orange portal on the floor,
 * facing up, right where the piston is. The piston and the whole cube start
 * inside the portal and come out of it together, so only what is above the
 * floor is drawn. The piston travels one cube further, over the same time
 * profile shape: constant acceleration up to the same launch speed.
 */
export const pistonLaunchPortal: ScenarioDefinition = {
  ...pistonLaunch,
  slug: "piston-launch-portal",
  description:
    "This is the same scenario, but the piston and the whole cube come out of the orange portal.",
  cube: {
    size: SIZE,
    keyframes: [
      { t: 0, x: 0, y: REST, interpolation: "linear" },
      { t: PUSH, x: 0, y: REST, slopeOut: { y: 0 } },
      { t: LAUNCH, x: 0, y: TOP, slopeIn: { y: SPEED }, slopeOut: { y: SPEED } },
      { t: IMPACT, x: 0, y: TOP, slopeIn: { y: -SPEED }, interpolation: "linear" },
      { t: END, x: 0, y: TOP },
    ],
  },
  props: [
    ...(pistonLaunch.props ?? []).map((p) =>
      p.kind === "piston"
        ? {
            ...p,
            showBase: false,
            extension: [
              { t: 0, value: -DEPTH, interpolation: "linear" as const },
              { t: PUSH, value: -DEPTH, slopeOut: 0 },
              { t: LAUNCH, value: STROKE, slopeIn: SPEED, slopeOut: 0, interpolation: "linear" as const },
              { t: END, value: STROKE },
            ],
          }
        : p,
    ),
    { kind: "portal", position: { x: 0, y: FLOOR }, height: 1.8, color: "orange", facing: "up" },
  ],
}
