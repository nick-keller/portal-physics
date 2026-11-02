import { buildScenario, type Scenario } from "@/engine/scenario"
import { upDown } from "./01-up-down"
import { upDownSpeed } from "./02-up-down-speed"
import { drop } from "./03-drop"
import { portals } from "./04-portals"
import { portalsApart } from "./05-portals-apart"
import { portalsApartFrames } from "./06-portals-apart-frames"
import { squareLoop } from "./07-square-loop"
import { portalTurn } from "./08-portal-turn"
import { portalFrames } from "./09-portal-frames"
import { portalFramesX } from "./10-portal-frames-x"
import { portalDropOnCube } from "./11-portal-drop-on-cube"
import { portalDropOnCubeFrames } from "./12-portal-drop-on-cube-frames"
import { portalDropOnCubeLaunch } from "./13-portal-drop-on-cube-launch"
import { pistonLaunch } from "./14-piston-launch"
import { pistonLaunchPortal } from "./15-piston-launch-portal"
import { portalSwallowsPiston } from "./16-portal-swallows-piston"
import { portalSwallowsShortPiston } from "./17-portal-swallows-short-piston"
import { portalDropOnCubeLaunchCopy } from "./18-portal-drop-on-cube-launch-copy"
import { portalDropOnRampLaunch } from "./19-portal-drop-on-ramp-launch"

/** Ordered list of scenarios, from simplest to most complex. */
export const scenarios: Scenario[] = [
  upDown,
  upDownSpeed,
  drop,
  portals,
  portalsApart,
  portalsApartFrames,
  squareLoop,
  portalTurn,
  portalFrames,
  portalFramesX,
  portalDropOnCube,
  portalDropOnCubeFrames,
  portalDropOnCubeLaunch,
  pistonLaunch,
  pistonLaunchPortal,
  portalSwallowsPiston,
  portalSwallowsShortPiston,
  portalDropOnCubeLaunchCopy,
  portalDropOnRampLaunch,
].map(buildScenario)

export const getScenario = (slug: string) => scenarios.find((s) => s.slug === slug)
export const getScenarioIndex = (slug: string) => scenarios.findIndex((s) => s.slug === slug)
