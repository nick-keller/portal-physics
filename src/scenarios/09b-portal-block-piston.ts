import type { Keyframe } from "@/engine/curve"
import type { PoseKeyframe, ScenarioDefinition } from "@/engine/scenario"

const FLOOR = 0
const HALF = 0.5
const X = 0 // piston, cube and block are lined up on this vertical
const STROKE = 2 // the piston is extended this high, and stays there
const CENTRE = FLOOR + STROKE + HALF // cube centre resting on the piston
const WIDTH = 4 // block width
const THICK = 2 // block height: the orange portal on top is this far above the blue one
const START = 5 // height of the block's bottom (blue portal) when the scene starts
const SPEED = 4 // average speed of the block, down and back up (it eases in and out)
const LAND = (START - FLOOR) / SPEED // block reaches the floor
const LEAVE = LAND + 1 // block starts back up
const BACK = LEAVE + LAND // block back where it started
const END = BACK + 0.5

/**
 * Height of the blue portal (the block's bottom) over time; the orange one is
 * THICK above. Flat tangents on every key make each move ease in and out.
 */
const blueHeight = (offset = 0): Keyframe[] => [
  { t: 0, value: START + offset, tangent: "flat" },
  { t: LAND, value: FLOOR + offset, tangent: "flat", interpolation: "linear" },
  { t: LEAVE, value: FLOOR + offset, tangent: "flat" },
  { t: BACK, value: START + offset, tangent: "flat", interpolation: "linear" },
  { t: END, value: START + offset },
]

const blockPath = (dx: number, dy: number): PoseKeyframe[] =>
  blueHeight(dy).map(({ t, value, interpolation, tangent }) => ({ t, interpolation, tangent, x: dx, y: value }))

/**
 * A still piston, extended 2 units, holds a still cube up. A 4 × 2 block
 * carrying both portals, blue facing down underneath and orange facing up on
 * top, comes down over the cube until it reaches the floor, waits a second,
 * and goes back up.
 *
 * Both portals move together, so folded x of the cube is its centre's distance
 * past the blue portal, CENTRE − y_blue, on both sides. On the orange side that
 * puts the cube at y_orange + CENTRE − y_blue = CENTRE + THICK: still in the
 * world, sitting on the part of the piston that sticks out of the orange
 * portal, whose head is always at STROKE + THICK.
 *
 * The piston is drawn twice: on the left, cut where the blue portal is, and
 * coming out of the orange portal, cut below it.
 *
 * The centre is measured from the portal on its side, along that portal's axes.
 */
export const portalBlockPiston: ScenarioDefinition = {
  slug: "portal-block-piston",
  title: "Moving portals",
  description:
    "Moving portals are easy as long as they move \"together\", meaning that their relative speed is 0 to one another. Notice that even tho the cube is not moving, since we measure its position relative to the portal, it actually has a speed!",
  concepts: ["Moving portals"],
  loop: true,
  cube: {
    size: 1,
    keyframes: blueHeight().map(({ t, value, interpolation, tangent }) => ({ t, interpolation, tangent, x: CENTRE - value, y: 0, angle: -90 })),
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "vx"] }],
  reference: { label: "P", portals: true },
  view: { min: { x: -4, y: -0.8 }, max: { x: 4, y: START + THICK + 0.8 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      kind: "piston",
      position: { x: X, y: FLOOR },
      width: 1.2,
      extension: [{ t: 0, value: STROKE }],
      // whatever is above the blue portal has gone through it
      cutAbove: blueHeight(),
    },
    {
      kind: "piston",
      position: { x: X, y: FLOOR + THICK },
      width: 1.2,
      showBase: false,
      extension: [{ t: 0, value: STROKE }],
      // sticks out of the orange portal by as much as went into the blue one
      cutBelow: blueHeight(THICK),
    },
    {
      kind: "solid",
      points: [
        { x: -WIDTH / 2, y: 0 },
        { x: WIDTH / 2, y: 0 },
        { x: WIDTH / 2, y: THICK },
        { x: -WIDTH / 2, y: THICK },
      ],
      path: blockPath(X, 0),
    },
    {
      kind: "portal",
      position: { x: X, y: START },
      height: 1.8,
      color: "blue",
      facing: "down",
      path: blockPath(X, 0),
    },
    {
      kind: "portal",
      position: { x: X, y: START + THICK },
      height: 1.8,
      color: "orange",
      facing: "up",
      path: blockPath(X, THICK),
    },
  ],
}
