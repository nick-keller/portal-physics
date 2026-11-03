import type { ScenarioDefinition } from "@/engine/scenario"

/** Gravity, in world units (metres, the cube is 1 m wide) per second squared. */
const G = 9.81
const FLOOR = 0
const HATCH = 5.5
const HALF = 0.5

const START = HATCH + HALF // cube centre resting on the hatch
const END = FLOOR + HALF // cube centre resting on the floor
const RELEASE = 1 // hatch opens, cube starts falling
const FALL = Math.sqrt((2 * (START - END)) / G) // time to fall, from h = ½·g·t²
const IMPACT = RELEASE + FALL

/**
 * Free fall from a trapdoor onto the floor.
 *
 * The falling segment is a bezier whose tangents are set explicitly: slope 0
 * when released and −g·t at impact. A cubic with those end values and slopes
 * is exactly the free-fall parabola y = y₀ − ½·g·t². At impact the tangent is
 * broken: it arrives at −g·t and leaves at 0, so y stays continuous while the
 * speed jumps to zero.
 */
export const drop: ScenarioDefinition = {
  slug: "drop",
  title: "Speed changes for a reason",
  description:
    "Notice that speed is continuous when the cube is in freefall. Hitting the ground makes it stop (almost) instantly, so the speed jumps. An object can only change speed instantly when it hits something hard.",
  concepts: ["Gravity", "Impact", "Discontinuous speed"],
  loop: false,
  cube: {
    size: 1,
    keyframes: [
      { t: 0, x: 0, y: START, interpolation: "linear" },
      { t: RELEASE, x: 0, y: START, slopeOut: { y: 0 } },
      { t: IMPACT, x: 0, y: END, slopeIn: { y: -G * FALL }, interpolation: "linear" },
      { t: IMPACT + 1.5, x: 0, y: END },
    ],
  },
  trackedPoints: [{ id: "center", label: "Centre", local: { x: 0, y: 0 }, series: ["y", "vy"] }],
  reference: { label: "O", position: { x: 0, y: FLOOR } },
  view: { min: { x: -3, y: -0.8 }, max: { x: 3, y: 7.3 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    {
      kind: "trapdoor",
      position: { x: 0, y: HATCH },
      width: 1.4,
      open: [
        { t: RELEASE, value: 0, tangent: "flat" },
        { t: RELEASE + 0.25, value: 95, tangent: "flat" },
      ],
    },
  ],
}
