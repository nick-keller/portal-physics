import type { ScenarioDefinition } from "@/engine/scenario"

const FLOOR = 0
const HALF = 0.5 // half the cube size: centre height above the face it rests on
const PORTALS = FLOOR + 2 // height of the two portals
const HEIGHT = 4 // how high the piston lifts the cube: far enough to clear the portals
const MOVE = 2 // seconds to go up, and to come back down
const HOLD = 1 // seconds stopped at the top and at the bottom

/** Height of the cube bottom (= piston extension) over one loop: wait, rise, wait, fall. */
const KEYS = [
  { t: 0, value: 0 },
  { t: HOLD, value: 0 },
  { t: HOLD + MOVE, value: HEIGHT },
  { t: 2 * HOLD + MOVE, value: HEIGHT },
  { t: 2 * HOLD + 2 * MOVE, value: 0 },
]

/**
 * Two portals placed back to back, touching at y = PORTALS: blue faces down,
 * orange faces up. Whatever enters one comes out of the other at the same spot,
 * with the same speed, so they behave like an open doorway.
 *
 * A piston under the cube pushes it up through the portals and brings it back
 * down, then loops (the last key only closes the loop back onto the first one).
 */
export const portals: ScenarioDefinition = {
  slug: "portals",
  title: "A door made of portals",
  description:
    "Two portals placed back to back changes nothing. It acts like a hoop or a door.",
  concepts: ["Portals"],
  loop: true,
  cube: {
    size: 1,
    // Keyframes are in folded space (see `ScenarioDefinition.props`): the portals
    // sit at the origin and going through them is moving along x. Both portals
    // are turned a quarter turn, so folded x is the world height above them.
    keyframes: KEYS.map(({ t, value }) => ({ t, x: FLOOR + value + HALF - PORTALS, y: 0, tangent: "flat" })),
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["y", "vy"] }],
  reference: { label: "O", position: { x: 0, y: FLOOR } },
  view: { min: { x: -3, y: -0.8 }, max: { x: 3, y: 5.8 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      // Same keys as the cube's bottom, so the head stays under it.
      kind: "piston",
      position: { x: 0, y: FLOOR },
      width: 1.2,
      extension: KEYS.map((k) => ({ ...k, tangent: "flat" })),
    },
    { kind: "portal", position: { x: 0, y: PORTALS }, height: 1.8, color: "blue", facing: "down" },
    { kind: "portal", position: { x: 0, y: PORTALS }, height: 1.8, color: "orange", facing: "up" },
  ],
}
