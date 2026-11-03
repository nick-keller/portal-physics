import type { ScenarioDefinition } from "@/engine/scenario"
import { portalTurn } from "./08-portal-turn"

/**
 * Same scene and motion as the previous scenario, but the centre is measured
 * from the portal on its side, along that portal's axes, instead of from the
 * world origin. Those coordinates are exactly folded space, so they stay smooth.
 */
export const portalFrames: ScenarioDefinition = {
  ...portalTurn,
  slug: "portal-frames",
  title: "Measuring from the portals",
  description:
    "Just like we did before, measuring position and speed relative to the portals fixes all the jumps. Physics works again.",
  concepts: ["Portals", "Reference frame", "Continuity"],
  reference: { label: "P", portals: true },
}
