import type { ScenarioDefinition } from "@/engine/scenario"
import { portalFrames } from "./09-portal-frames"

/**
 * Same as the previous scenario, but y and vy are hidden: measured from the
 * portals, they stay at zero the whole time, so only x and vx are shown.
 */
export const portalFramesX: ScenarioDefinition = {
  ...portalFrames,
  slug: "portal-frames-x",
  title: "Simplifying",
  description:
    "While we are at it, since Y does not change now, we can just track position and speed along X.",
  concepts: ["One dimension"],
  trackedPoints: portalFrames.trackedPoints.map((p) => ({ ...p, series: ["x", "vx"] })),
}
