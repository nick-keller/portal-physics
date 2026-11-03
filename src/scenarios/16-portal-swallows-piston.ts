import type {PoseKeyframe, ScenarioDefinition} from "@/engine/scenario"

/** Gravity, in world units (metres, the cube is 1 m wide) per second squared. */
const G = 9.81
const FLOOR = 0
const HALF = 0.5
const SIZE = 1
const LEFT_X = -2
const ORANGE = { x: 2, y: FLOOR }

const STROKE = 2 // the piston is extended this high, and stays there
const CENTRE = FLOOR + STROKE + HALF // cube centre resting on the piston
const START = 6 // blue portal height when the scene starts, well above the cube
const SPEED = 8 // how fast the blue portal comes down
const LAND = (START - FLOOR) / SPEED // blue portal touches the floor, piston and cube fully through
const FLIGHT = (2 * SPEED) / G // up and back down to the same height, from v = v₀ − g·t
const IMPACT = LAND + FLIGHT
const END = IMPACT + 1.5

let BLUE_PATH: PoseKeyframe[] = [
  { t: 0, x: LEFT_X, y: START, interpolation: "linear" },
  { t: LAND, x: LEFT_X, y: FLOOR, interpolation: "linear" },
  { t: END, x: LEFT_X, y: FLOOR },
];
/**
 * A still piston, extended 2 units, holds the cube up. The blue portal, facing
 * down, starts above the cube and comes down to the floor, swallowing the cube
 * and then the piston; both come out of the orange portal on the floor.
 *
 * Folded x of the cube is its centre's distance past the blue portal, so on
 * the left it is CENTRE − y_blue; on the orange side it is the height of the
 * centre above the floor. The piston is drawn twice: on the left, cut where the
 * blue portal is, and on the right, sticking out of the orange portal by as
 * much as has gone into the blue one.
 *
 * When the blue portal stops, so does the piston, which is just standing on
 * the floor. The cube keeps the speed it had coming out: it flies up, gravity
 * brings it back, and it lands on the piston. The flight is a bezier leaving
 * at +v₀ and arriving at −v₀, which is exactly the free-fall parabola.
 *
 * The centre is measured from the portal on its side, along that portal's
 * axes, which is folded space: only x and vx are shown.
 */
export const portalSwallowsPiston: ScenarioDefinition = {
  slug: "portal-swallows-piston",
  title: "Revealing the blue side",
  description:
    "Now we discover what was on the blue side. This should not change what we observe on the orange side. The fact that the blue portal was the one moving should not stop the cube from launching once the piston stops.",
  concepts: ["Moving portal", "Piston", "Launch", "Gravity"],
  loop: false,
  cube: {
    size: SIZE,
    keyframes: [
      { t: 0, x: CENTRE - START, y: 0, angle: -90, interpolation: "linear" },
      { t: LAND, x: CENTRE, y: 0, angle: -90, slopeOut: { x: SPEED, y: 0, angle: 0 } },
      { t: IMPACT, x: CENTRE, y: 0, angle: -90, slopeIn: { x: -SPEED, y: 0, angle: 0 }, interpolation: "linear" },
      { t: END, x: CENTRE, y: 0, angle: -90 },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "vx"] }],
  reference: { label: "P", portals: true },
  view: { min: { x: -4, y: -0.8 }, max: { x: 4, y: 7 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      // 2 × 2 block sitting on the blue portal, carried down with it
      kind: "solid",
      points: [
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 2 },
        { x: -1, y: 2 },
      ],
      path: BLUE_PATH,
    },
    {
      kind: "piston",
      position: { x: LEFT_X, y: FLOOR },
      width: 1.2,
      extension: [{ t: 0, value: STROKE }],
      // whatever is above the blue portal has gone through it
      cutAbove: [
        { t: 0, value: START, interpolation: "linear" },
        { t: LAND, value: FLOOR, interpolation: "linear" },
        { t: END, value: FLOOR },
      ],
    },
    {
      kind: "piston",
      position: ORANGE,
      width: 1.2,
      showBase: false,
      // sticks out of the orange portal by as much as went into the blue one
      extension: [
        { t: 0, value: STROKE - (START - FLOOR), interpolation: "linear" },
        { t: LAND, value: STROKE, interpolation: "linear" },
        { t: END, value: STROKE },
      ],
    },
    {
      kind: "portal",
      position: { x: LEFT_X, y: START },
      height: 1.8,
      color: "blue",
      facing: "down",
      path: BLUE_PATH,
    },
    { kind: "portal", position: ORANGE, height: 1.8, color: "orange", facing: "up" },
  ],
}
