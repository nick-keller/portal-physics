import type { ScenarioDefinition } from "@/engine/scenario"
import { portalDropOnCube } from "./11-portal-drop-on-cube"

/**
 * Same scene and motion as the previous scenario, but the centre is measured
 * from the portal on its side, along that portal's axes. Those coordinates are
 * exactly folded space: x goes smoothly from −5½ to ½ and y stays at zero, so
 * only x and vx are shown. vx still jumps, from 8 to 0, but only when the blue
 * portal stops, 1/16 s after the centre went through.
 */
export const portalDropOnCubeFrames: ScenarioDefinition = {
  ...portalDropOnCube,
  slug: "portal-drop-on-cube-frames",
  title: "A jump in the wrong place",
  description:
    "Now we track position from the portals. It removed the jump when the point passes through the portal, but we still have a jump in speed, even after the cube has passed, just like if the cube suddenly hit a wall...",
  concepts: ["Moving portal", "Reference frame", "Discontinuous speed"],
  reference: { label: "P", portals: true },
  trackedPoints: portalDropOnCube.trackedPoints.map((p) => ({ ...p, series: ["x", "vx"] })),
}
