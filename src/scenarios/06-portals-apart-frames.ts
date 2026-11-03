import type { ScenarioDefinition } from "@/engine/scenario"
import { portalsApart } from "./05-portals-apart"

/**
 * Same scene and motion as the portals-apart scenario, but the centre is
 * measured from the portal on its side instead of from the world origin. Those
 * coordinates are exactly folded space, so x no longer jumps.
 */
export const portalsApartFrames: ScenarioDefinition = {
  ...portalsApart,
  slug: "portals-apart-frames",
  title: "A matter of reference",
  description:
    "To avoid this jump in position when the point we track passes through the portal, we can just change the reference point as it passes through. Now the position and speed are continuous, and physics still works!",
  concepts: ["Reference frame", "Continuous position"],
  reference: { label: "P", portals: true },
  // in a portal frame, x is the distance along the way through the portals
  trackedPoints: [{ ...portalsApart.trackedPoints[0], series: ["x", "vx"] }],
}
