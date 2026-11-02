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
    "We apply the same trick to avoid jumps, we now measure the cube from the portals instead of from a fixed point. Seen this way, going through the portals is just moving on: x and vx stay continuous, exactly as when the portals touched. The jumps of the previous scenario came from the fixed reference, not from the motion itself.",
  concepts: ["Portals", "Reference frame", "Continuity"],
  reference: { label: "P", portals: true },
}
