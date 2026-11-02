import type { ScenarioDefinition } from "@/engine/scenario"
import { portals } from "./04-portals"

const BLUE = -1
const ORANGE = 1

/**
 * Same motion as the previous scenario, but the portals are pulled 2 units
 * apart. The keyframes are unchanged: they are authored in folded space, where
 * the portals still touch at x = 0, and the portal props lay that space out in
 * the world, so the cube runs from −5 to 5 and skips the stretch between portals.
 */
export const portalsApart: ScenarioDefinition = {
  ...portals,
  slug: "portals-apart",
  title: "Position jumps, speed does not",
  description:
    "Same cube, same motion, but the portals are now 2 units apart. Its position jumps by 2 the instant its centre goes through: x is no longer continuous. Its speed is untouched, though: it leaves the orange portal exactly as fast as it entered the blue one, so vx stays continuous.",
  concepts: ["Portals", "Discontinuous position", "Continuous speed"],
  view: { min: { x: -6.5, y: -2 }, max: { x: 6.5, y: 2.5 } },
  props: [
    { kind: "portal", position: { x: BLUE, y: 0 }, height: 1.8, color: "blue", facing: "left" },
    { kind: "portal", position: { x: ORANGE, y: 0 }, height: 1.8, color: "orange", facing: "right" },
  ],
}
