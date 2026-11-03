import type { ScenarioDefinition } from "@/engine/scenario"

const FLOOR = 0
const HALF = 0.5 // half the cube size: centre height above the face it rests on
const HEIGHT = 3 // how high the piston lifts the cube
const MOVE = 0.8 // seconds to go up, and to come back down
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
 * The simplest possible motion: the cube waits, goes up, waits, comes back
 * down, then loops (the last key only closes the loop back onto the first one).
 * Only the y coordinate of the bottom face is tracked, since x never changes.
 */
export const upDown: ScenarioDefinition = {
  slug: "up-down",
  title: "Tracking position",
  description:
    "We can track the position of a single point of the cube over time. Here we track a point at the bottom. Click on the arrow on the bottom right of your screen to see the next scenario!",
  concepts: ["Position"],
  loop: true,
  cube: {
    size: 1,
    keyframes: KEYS.map(({ t, value }) => ({ t, x: 0, y: FLOOR + value + HALF, tangent: "flat" })),
  },
  trackedPoints: [{ id: "bottom", label: "Bottom", local: { x: 0, y: -0.5 }, series: ["y"] }],
  reference: { label: "O", position: { x: 0, y: FLOOR } },
  view: { min: { x: -2.5, y: -0.8 }, max: { x: 2.5, y: 4.5 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      // Same keys as the cube's bottom, so the head stays under it.
      kind: "piston",
      position: { x: 0, y: FLOOR },
      width: 1.2,
      extension: KEYS.map((k) => ({ ...k, tangent: "flat" })),
    },
  ],
}
