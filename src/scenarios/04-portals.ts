import type { ScenarioDefinition } from "@/engine/scenario"

/**
 * Two portals placed back to back, touching at x = 0: blue faces left, orange
 * faces right. Whatever enters one comes out of the other at the same spot,
 * with the same speed, so they behave like an open doorway.
 *
 * Two keyframes (the third key only closes the loop back onto the first one),
 * like the first scenario but along x.
 */
export const portals: ScenarioDefinition = {
  slug: "portals",
  title: "A portal that changes nothing",
  description:
    "Two portals, blue and orange, are placed back to back so that they touch. Since the exit is exactly where the entrance is, and faces the way the cube is going, nothing changes: x stays continuous and so does vx. The portals act like an open door.",
  concepts: ["Portals", "Continuity"],
  loop: true,
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: -4, y: 0 },
      { t: 2, x: 4, y: 0 },
      { t: 4, x: -4, y: 0 },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "vx"] }],
  reference: { label: "O", position: { x: 0, y: 0 } },
  view: { min: { x: -5.5, y: -2 }, max: { x: 5.5, y: 2.5 } },
  props: [
    { kind: "portal", position: { x: 0, y: 0 }, height: 1.8, color: "blue", facing: "left" },
    { kind: "portal", position: { x: 0, y: 0 }, height: 1.8, color: "orange", facing: "right" },
  ],
}
