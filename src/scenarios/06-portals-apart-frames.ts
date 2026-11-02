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
  title: "Measuring from the portals",
  description:
    "To avoid having the position jump, we now measure the cube from the portals instead of from a fixed point. While its centre is on the blue side, we measure from the blue portal, with x pointing into it; once through, we measure from the orange portal, with x pointing out of it. Seen this way, the jump in x disappears: going through the portals is just moving on, exactly as when they touched. The jump of the previous scenario came from the fixed reference, not from the motion itself.",
  concepts: ["Portals", "Reference frame", "Continuous position"],
  reference: { label: "P", portals: true },
}
