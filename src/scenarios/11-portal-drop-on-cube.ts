import type { ScenarioDefinition } from "@/engine/scenario"

const FLOOR = 0
const HALF = 0.5
const CUBE_X = -2
const ORANGE = { x: 2, y: FLOOR }

const START = 6 // blue portal height when the scene starts
const SPEED = 8 // how fast the blue portal comes down
const LAND = (START - FLOOR) / SPEED // blue portal touches the floor
const END = LAND + 1.5

/**
 * The cube rests on the floor; the blue portal, facing down, comes down over
 * it until it touches the floor, while the orange portal lies on the floor
 * facing up.
 *
 * In folded space the blue half is placed by the moving blue portal, so the
 * cube, still in the world, has to move into the portal there: its folded x
 * is the distance from the portal down to its centre, negated, x = ½ − y_blue.
 * When the portal reaches the floor, x = ½: the cube is fully out of the
 * orange portal, sitting on the floor, and stops right there.
 *
 * Folded angle −90° keeps the cube upright on both sides.
 */
export const portalDropOnCube: ScenarioDefinition = {
  slug: "portal-drop-on-cube",
  title: "A still cube comes out moving",
  description:
    "Until now, the two portals were fixed, now one moves relative to the other. The cube never moves, yet it comes out of the orange portal going up, as fast as the blue portal came down. Let's assume for now that it stops the instant it is fully out, sitting on the floor. Notice that the speed jumps twice",
  concepts: ["Moving portal", "World frame", "Discontinuous speed"],
  loop: false,
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: HALF - START, y: 0, angle: -90, interpolation: "linear" },
      { t: LAND, x: HALF - FLOOR, y: 0, angle: -90, interpolation: "linear" },
      { t: END, x: HALF - FLOOR, y: 0, angle: -90 },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["y", "vy"] }],
  reference: { label: "O", position: { x: 0, y: FLOOR } },
  view: { min: { x: -4, y: -0.8 }, max: { x: 4, y: 7 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      kind: "portal",
      position: { x: CUBE_X, y: START },
      height: 1.8,
      color: "blue",
      facing: "down",
      path: [
        { t: 0, x: CUBE_X, y: START, interpolation: "linear" },
        { t: LAND, x: CUBE_X, y: FLOOR, interpolation: "linear" },
        { t: END, x: CUBE_X, y: FLOOR },
      ],
    },
    { kind: "portal", position: ORANGE, height: 1.8, color: "orange", facing: "up" },
  ],
}
