import type { ScenarioDefinition } from "@/engine/scenario"
import { pistonLaunchPortal } from "./15-piston-launch-portal"

const FLOOR = 0
const HALF = 0.5
const SIZE = 1

const LEFT = -2.5 // x of the piston on the left, under the blue portal
const BLUE = 2 // height of the blue portal, facing down above the left piston
const SLAB = 0.4 // thickness of the block holding the blue portal
const STROKE = 2 // how far above the floor the piston sticks out of the orange portal at the end
const TRAVEL = BLUE + STROKE // total piston travel, from flush with the floor
const PUSH = 1 // piston starts pushing
const SPEED = 8 // piston speed when it reaches the end of its stroke
const RISE = (2 * TRAVEL) / SPEED // constant acceleration from rest: d = ½·v·t
const LAUNCH = PUSH + RISE // piston stops, cube leaves it
const G = 9.81
const FLIGHT = (2 * SPEED) / G // up and back down to the same height, from v = v₀ − g·t
const IMPACT = LAUNCH + FLIGHT
const END = IMPACT + 1.5

// Folded x of the cube centre is its distance past the blue portal, which on
// the orange side is its height above the orange portal on the floor.
const REST = FLOOR + HALF - BLUE // resting on the retracted left piston, below the blue portal
const TOP = FLOOR + STROKE + HALF // resting on the part of the piston out of the orange portal

/** Piston head height above its base, over time: same profile on both sides, offset by `offset`. */
const extension = (offset: number) => [
  { t: 0, value: offset, interpolation: "linear" as const },
  { t: PUSH, value: offset, slopeOut: 0 },
  { t: LAUNCH, value: offset + TRAVEL, slopeIn: SPEED, slopeOut: 0, interpolation: "linear" as const },
  { t: END, value: offset + TRAVEL },
]

/**
 * Same launch as the previous scenario, but the piston and cube now start out
 * of the portals: a piston on the left, flush with the floor, carries the cube
 * up into a blue portal facing down. Whatever goes into the blue portal comes
 * out of the orange one on the floor, so the piston is drawn twice: on the
 * left cut at the blue portal, and on the right sticking out of the orange
 * portal by as much as went in. The piston stops dead and the cube flies off,
 * just like before.
 */
export const pistonLaunchTwoPortals: ScenarioDefinition = {
  ...pistonLaunchPortal,
  slug: "piston-launch-two-portals",
  title: "Revealing the blue side",
  description:
    "Now we see whats on the blue side, this does not change the outcome.",
  cube: {
    size: SIZE,
    keyframes: [
      { t: 0, x: REST, y: 0, angle: -90, interpolation: "linear" },
      { t: PUSH, x: REST, y: 0, angle: -90, slopeOut: { x: 0 } },
      { t: LAUNCH, x: TOP, y: 0, angle: -90, slopeIn: { x: SPEED }, slopeOut: { x: SPEED } },
      { t: IMPACT, x: TOP, y: 0, angle: -90, slopeIn: { x: -SPEED }, interpolation: "linear" },
      { t: END, x: TOP, y: 0, angle: -90 },
    ],
  },
  // measured from the portal on the cube's side, along its axis: x points through the portal
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "vx"] }],
  reference: { label: "P", portals: true },
  view: { min: { x: -4.5, y: -0.8 }, max: { x: 3.5, y: 6.8 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      kind: "piston",
      position: { x: LEFT, y: FLOOR },
      width: 1.2,
      extension: extension(0),
      // whatever is above the blue portal has gone through it
      cutAbove: [{ t: 0, value: BLUE }],
    },
    {
      kind: "piston",
      position: { x: 0, y: FLOOR },
      width: 1.2,
      showBase: false,
      extension: extension(-BLUE),
    },
    {
      kind: "solid",
      points: [
        { x: LEFT - 1.2, y: BLUE },
        { x: LEFT + 1.2, y: BLUE },
        { x: LEFT + 1.2, y: BLUE + SLAB },
        { x: LEFT - 1.2, y: BLUE + SLAB },
      ],
    },
    { kind: "portal", position: { x: LEFT, y: BLUE }, height: 1.8, color: "blue", facing: "down" },
    { kind: "portal", position: { x: 0, y: FLOOR }, height: 1.8, color: "orange", facing: "up" },
  ],
}
