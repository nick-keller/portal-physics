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
  title: "Speed keeps its size, not its direction",
  description:
    "Same cube, same motion, but the orange portal is rotated. Its position jumps, as before. Its speed jumps too, but only in direction: the portal turns it a quarter turn, so vx suddenly drops to zero while vy suddenly takes its value. The cube goes just as fast, in a new direction.",
  concepts: ["Portals", "Direction of speed", "Discontinuous speed"],
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["x", "y", "vx", "vy"] }],
  view: { min: { x: -6, y: -2 }, max: { x: 3.5, y: 3.5 } },
  props: [
    { kind: "portal", position: BLUE, height: 1.8, color: "blue", facing: "left" },
    { kind: "portal", position: ORANGE, height: 1.8, color: "orange", facing: "up" },
  ],
}
