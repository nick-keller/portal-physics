import type { ScenarioDefinition } from "@/engine/scenario"
import { portalFrames } from "./09-portal-frames"

/**
 * Same as the previous scenario, but y and vy are hidden: measured from the
 * portals, they stay at zero the whole time, so only x and vx are shown.
 */
export const portalFramesX: ScenarioDefinition = {
  ...portalFrames,
  slug: "portal-frames-x",
  title: "Only x moves",
  description:
    "Measured this way, y and vy stay at zero the whole time, so we stop showing them: the whole trip, through the portals and back, is described by x and vx alone, exactly as when the portals touched.",
  concepts: ["Portals", "Reference frame", "One dimension"],
  trackedPoints: portalFrames.trackedPoints.map((p) => ({ ...p, series: ["x", "vx"] })),
}
