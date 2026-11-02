import type { ScenarioDefinition } from "@/engine/scenario"
import { upDown } from "./01-up-down"

/**
 * Same motion as the first scenario, now also graphing the vertical speed.
 * Speed is not animated on its own: it is derived from the position curve.
 */
export const upDownSpeed: ScenarioDefinition = {
  ...upDown,
  slug: "up-down-speed",
  title: "Speed comes from position",
  description:
    "Same cube, same motion. Speed is not stored anywhere: it is computed from position, as how much y changes over a tiny slice of time (vy ≈ Δy / Δt). Because the position curve is smooth, the speed is continuous too, it never jumps.",
  concepts: ["Speed", "Derivative", "Continuity"],
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["y", "vy"] }],
}
