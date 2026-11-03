import type { SceneProp, ScenarioDefinition } from "@/engine/scenario"
import { portals } from "./04-portals"

const FLOOR = 0
const BLUE = FLOOR + 2 // height of the blue portal, facing down
const GAP = 2 // how far above the blue portal the orange one sits
const ORANGE = BLUE + GAP // height of the orange portal, facing up
const BLOCK = 4 // width of the block between the portals (its height is GAP)

type PistonProp = Extract<SceneProp, { kind: "piston" }>
const piston = portals.props?.find((p): p is PistonProp => p.kind === "piston")
if (!piston) throw new Error("portals scenario has no piston")

/**
 * Same motion as the previous scenario, but the orange portal is lifted 2 units
 * above the blue one. The keyframes are unchanged: they are authored in folded
 * space, where the portals still touch, and the portal props lay that space out
 * in the world, so the cube skips the 2 units between the portals.
 *
 * The piston is drawn twice: under the blue portal, cut where it enters it, and
 * above the orange one, sticking out by as much as has gone into the blue one.
 */
export const portalsApart: ScenarioDefinition = {
  ...portals,
  slug: "portals-apart",
  title: "Splitting portals apart",
  description:
    "Now that the two portals are split apart, the cube teleports. Even tho the position jumps abruptly, the speed is unaffected: \"Speedy things goes in, speedy things come out\".",
  concepts: ["Portals", "Discontinuous position", "Continuous speed"],
  view: { min: { x: -3.5, y: -0.8 }, max: { x: 3.5, y: 7.8 } },
  props: [
    { kind: "floor", y: FLOOR, from: -50, to: 50 },
    // block the portals sit on: blue on its underside, orange on its top
    {
      kind: "solid",
      points: [
        { x: -BLOCK / 2, y: BLUE },
        { x: BLOCK / 2, y: BLUE },
        { x: BLOCK / 2, y: ORANGE },
        { x: -BLOCK / 2, y: ORANGE },
      ],
    },
    // whatever is above the blue portal has gone through it
    { ...piston, cutAbove: [{ t: 0, value: BLUE }] },
    {
      ...piston,
      position: { x: 0, y: ORANGE },
      showBase: false,
      // sticks out of the orange portal by as much as went into the blue one
      extension: piston.extension.map((k) => ({ ...k, value: k.value - (BLUE - FLOOR) })),
    },
    { kind: "portal", position: { x: 0, y: BLUE }, height: 1.8, color: "blue", facing: "down" },
    { kind: "portal", position: { x: 0, y: ORANGE }, height: 1.8, color: "orange", facing: "up" },
  ],
}
