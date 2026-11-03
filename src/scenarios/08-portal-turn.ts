import type { ScenarioDefinition } from "@/engine/scenario"
import { portals } from "./04-portals"

const BLUE = { x: -1, y: 0 }
const ORANGE = { x: 2, y: -1 }

/**
 * Same motion as the portals-apart scenario, but the orange portal lies flat
 * and faces up. The keyframes are still authored in folded space; the orange
 * half of it is turned a quarter turn, so moving right there becomes moving up.
 */
export const portalTurn: ScenarioDefinition = {
  ...portals,
  slug: "portal-turn",
  title: "Rotated portals",
  description:
    "When one of the portal is rotated, the position AND the speed jump abruptly. All the speed in the X direction is instantly transferred in the Y direction. Earlier we saw that only hitting something hard could explain a jump in speed, so we must be measuring it wrong.",
  concepts: ["Portals", "Direction of speed", "Discontinuous speed"],
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "y", "vx", "vy"] }],
  view: { min: { x: -6, y: -2 }, max: { x: 3.5, y: 3.5 } },
  props: [
    { kind: "floor", y: ORANGE.y, from: -50, to: 50 },
    {
      kind: "solid",
      points: [
        { x: BLUE.x, y: ORANGE.y },
        { x: BLUE.x + 1, y: ORANGE.y },
        { x: BLUE.x + 1, y: ORANGE.y + 2 },
        { x: BLUE.x, y: ORANGE.y + 2 },
      ],
    },
    // Folded space: the shoulder sits 4 units left of the blue portal, on the
    // ground (the floor is 1 unit below the cube's centre).
    { kind: "claw", mount: { x: -4, y: 0 }, post: BLUE.y - ORANGE.y },
    { kind: "portal", position: BLUE, height: 1.8, color: "blue", facing: "left" },
    { kind: "portal", position: ORANGE, height: 1.8, color: "orange", facing: "up" },
  ],
}
