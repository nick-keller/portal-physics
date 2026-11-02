import type { ScenarioDefinition } from "@/engine/scenario"

/**
 * The simplest possible motion: the cube goes up, then back down, then loops.
 * Two keyframes (the third key only closes the loop back onto the first one).
 * Only the y coordinate of the centre is tracked, since x never changes.
 */
export const upDown: ScenarioDefinition = {
  slug: "up-down",
  title: "One number over time",
  description:
    "A companion cube rises and falls. Its centre is measured from the world origin, and since it only moves vertically, a single number, y, describes where it is at any moment.",
  concepts: ["Reference point", "Keyframes", "Bezier interpolation"],
  loop: true,
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: 0, y: 0 },
      { t: 1.5, x: 0, y: 3 },
      { t: 3, x: 0, y: 0 },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["y"] }],
  reference: { label: "O", position: { x: 0, y: 0 } },
  view: { min: { x: -2.5, y: -1 }, max: { x: 2.5, y: 4 } },
}
