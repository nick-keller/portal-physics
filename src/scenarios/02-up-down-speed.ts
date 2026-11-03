import type { ScenarioDefinition } from "@/engine/scenario"
import { upDown } from "./01-up-down"

/**
 * Same motion as the first scenario, now also graphing the vertical speed.
 * Speed is not animated on its own: it is derived from the position curve.
 */
export const upDownSpeed: ScenarioDefinition = {
  ...upDown,
  slug: "up-down-speed",
  title: "Speed is just how fast you change position",
  description:
    "When the cube is not moving, the speed is zero. Notice that the speed can be negative, it would be like your car showing a negative value when you reverse, not practical in real life, but useful when doing physics!",
  concepts: ["Speed"],
  trackedPoints: [{ ...upDown.trackedPoints[0], series: ["y", "vy"] }],
}
