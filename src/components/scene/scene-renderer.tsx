"use client"

import { useId, useMemo, type ReactNode } from "react"
import {
  FACING_ANGLE,
  poseAt,
  portalPathCurves,
  portalSide,
  portalTransform,
  trackedReferenceFrame,
  trackedRelativePosition,
  trackedSeries,
  trackedState,
  trackedWorldPosition,
  type Scenario,
  type SceneProp,
} from "@/engine/scenario"
import { createCurve, evaluateCurve } from "@/engine/curve"
import { localToWorld, radToDeg, type Pose, type Vec2 } from "@/engine/math"
import { formatNumber } from "@/lib/utils"
import { CompanionCube } from "./companion-cube"

const PAD = 0.5
const MINOR = 0.25
const MAJOR = 1
const FONT = 0.2
/** Velocity arrows show the displacement over this many seconds. */
const VELOCITY_SCALE = 0.3

/**
 * World-space SVG renderer. World coordinates use y-up; the root group flips the
 * axis so everything inside can be authored in maths orientation. Use `<Label>`
 * for text so it is flipped back upright.
 */
export function SceneRenderer({ scenario, time }: { scenario: Scenario; time: number }) {
  const { view, reference } = scenario
  const viewBox = [
    view.min.x - PAD,
    -(view.max.y + PAD),
    view.max.x - view.min.x + 2 * PAD,
    view.max.y - view.min.y + 2 * PAD,
  ].join(" ")

  const pose = poseAt(scenario, time)
  // The reference frame shown is the first tracked point's: with a portal
  // reference it hops from one portal to the other as that point goes through.
  const frame = scenario.trackedPoints[0]
    ? trackedReferenceFrame(scenario, pose, scenario.trackedPoints[0], time)
    : { position: "position" in reference ? reference.position : { x: 0, y: 0 }, angle: 0 }
  const movingFrame = "portals" in reference

  // Integer ticks along the axes inside the framed view.
  const ticks = useMemo(() => {
    const range = (a: number, b: number) =>
      Array.from({ length: Math.floor(b) - Math.ceil(a) + 1 }, (_, i) => Math.ceil(a) + i)
    return {
      x: range(view.min.x, view.max.x).filter((v) => v !== 0),
      y: range(view.min.y, view.max.y).filter((v) => v !== 0),
    }
  }, [view])

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="block size-full select-none">
      <defs>
        <pattern id="grid-minor" width={MINOR} height={MINOR} patternUnits="userSpaceOnUse">
          <path
            d={`M ${MINOR} 0 L 0 0 0 ${MINOR}`}
            fill="none"
            className="stroke-[var(--blueprint-minor)]"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern id="grid-major" width={MAJOR} height={MAJOR} patternUnits="userSpaceOnUse">
          <rect width={MAJOR} height={MAJOR} fill="url(#grid-minor)" />
          <path
            d={`M ${MAJOR} 0 L 0 0 0 ${MAJOR}`}
            fill="none"
            className="stroke-[var(--blueprint-major)]"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern id="floor-hatch" width={0.2} height={0.2} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={0.2} className={INK} strokeOpacity={0.45} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </pattern>
      </defs>

      <g transform="scale(1,-1)">
        {/* blueprint */}
        <rect x={-500} y={-500} width={1000} height={1000} className="fill-[var(--blueprint-bg)]" />
        <rect x={-500} y={-500} width={1000} height={1000} fill="url(#grid-major)" />

        {/* world axes through the origin */}
        <line x1={-500} y1={0} x2={500} y2={0} className="stroke-[var(--blueprint-ink)]" strokeOpacity={0.35} strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        <line x1={0} y1={-500} x2={0} y2={500} className="stroke-[var(--blueprint-ink)]" strokeOpacity={0.35} strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        {ticks.x.map((v) => (
          <Label key={`tx${v}`} at={{ x: v, y: -0.08 }} anchor="middle" baseline="hanging" className="fill-[var(--blueprint-ink)] opacity-50">
            {v}
          </Label>
        ))}
        {ticks.y.map((v) => (
          <Label key={`ty${v}`} at={{ x: -0.08, y: v }} anchor="end" baseline="middle" className="fill-[var(--blueprint-ink)] opacity-50">
            {v}
          </Label>
        ))}

        {/* props: floor, trapdoor… */}
        {scenario.props?.map((prop, i) => <Prop key={i} prop={prop} time={time} />)}

        {/* the cube */}
        <PortalCube scenario={scenario} time={time} />

        {/* reference point, with its axes when they are not the world's */}
        {movingFrame && <FrameAxes frame={frame} />}
        <g transform={`translate(${frame.position.x} ${frame.position.y})`}>
          <circle r={0.09} fill="none" className="stroke-[var(--blueprint-ink)]" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <circle r={0.025} className="fill-[var(--blueprint-ink)]" />
          <Label at={{ x: -0.14, y: -0.14 }} anchor="end" baseline="hanging" className="fill-[var(--blueprint-ink)] font-semibold" size={FONT * 1.2}>
            {reference.label}
          </Label>
        </g>

        {/* tracked points, with their x / y components along the reference axes */}
        {scenario.trackedPoints.map((p) => {
          const w = trackedWorldPosition(scenario, pose, p, time)
          const { x: rx, y: ry } = trackedRelativePosition(scenario, pose, p, time)
          const series = trackedSeries(p)
          const showX = series.includes("x")
          const showY = series.includes("y")
          const showVx = series.includes("vx")
          const showVy = series.includes("vy")
          const state = showVx || showVy ? trackedState(scenario, time, p) : null
          return (
            <g key={p.id}>
              {/* drawn in the point's reference frame, so components follow its axes */}
              <g transform={poseTransform(trackedReferenceFrame(scenario, pose, p, time))}>
                {showX && (
                  <line x1={0} y1={0} x2={rx} y2={0} className="stroke-chart-1" strokeWidth={2} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                )}
                {showY && (
                  <line x1={rx} y1={0} x2={rx} y2={ry} className="stroke-chart-2" strokeWidth={2} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                )}
                {state && (
                  <Arrow
                    from={{ x: rx, y: ry }}
                    to={{
                      x: rx + (showVx ? state.vx : 0) * VELOCITY_SCALE,
                      y: ry + (showVy ? state.vy : 0) * VELOCITY_SCALE,
                    }}
                    className={showVx && !showVy ? "fill-chart-3 stroke-chart-3" : "fill-chart-4 stroke-chart-4"}
                  />
                )}
              </g>
              <circle cx={w.x} cy={w.y} r={0.065} className="fill-chart-3 stroke-white" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              <Label at={{ x: w.x + scenario.cube.size * 0.6, y: w.y + 0.12 }} className="fill-white font-mono" size={FONT * 0.9}>
                {showX && <tspan className="fill-chart-1">{showY ? "" : "x "}{formatNumber(rx)}</tspan>}
                {showX && showY && <tspan className="fill-white/60">, </tspan>}
                {showY && <tspan className="fill-chart-2">{showX ? "" : "y "}{formatNumber(ry)}</tspan>}
              </Label>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/** SVG transform for a rigid pose (the root group is y-up, so angles are CCW). */
const poseTransform = (p: Pose) => `translate(${p.position.x} ${p.position.y}) rotate(${radToDeg(p.angle)})`

/**
 * The cube, drawn in world space. While it straddles a portal pair it is drawn
 * twice: the part not yet through, cut at the entry portal, and the part already
 * through, cut at the exit portal, so it slides out of one as it slides into the other.
 * Each copy is the folded-space cube placed by its side's transform, clipped to
 * its half of folded space placed the same way.
 */
function PortalCube({ scenario, time }: { scenario: Scenario; time: number }) {
  const clipId = useId()
  const pose = poseAt(scenario, time)
  const pair = scenario.portalPair && {
    blue: portalTransform(scenario, -1, time),
    orange: portalTransform(scenario, 1, time),
  }
  const size = scenario.cube.size
  const copy = (side: -1 | 1, key: string, clip?: string) => (
    <g key={key} clipPath={clip ? `url(#${clip})` : undefined}>
      <g transform={`${poseTransform(portalTransform(scenario, side, time))} ${poseTransform(pose)} scale(${size} ${-size})`}>
        <CompanionCube id={`${clipId}-${key}`} />
      </g>
    </g>
  )

  // Half the cube's horizontal extent in folded space, whatever its rotation.
  const reach = (size / 2) * (Math.abs(Math.cos(pose.angle)) + Math.abs(Math.sin(pose.angle)))
  const apart =
    pair &&
    (pair.blue.angle !== pair.orange.angle ||
      pair.blue.position.x !== pair.orange.position.x ||
      pair.blue.position.y !== pair.orange.position.y)
  const straddles = apart && Math.abs(pose.position.x) < reach
  if (!pair) {
    // A lone portal: whatever is behind it is still on the other side, so only
    // the part of the cube in front of its opening is drawn.
    const lone = scenario.props?.find((p) => p.kind === "portal")
    if (!lone) return copy(1, "whole")
    const curves = portalPathCurves(lone, scenario.loop)
    const position = { x: evaluateCurve(curves.x, time), y: evaluateCurve(curves.y, time) }
    const front: Pose = { position, angle: FACING_ANGLE[lone.facing] }
    return (
      <g>
        <defs>
          <clipPath id={`${clipId}-lone`}>
            <rect transform={poseTransform(front)} x={0} y={-500} width={500} height={1000} />
          </clipPath>
        </defs>
        {copy(1, "whole", `${clipId}-lone`)}
      </g>
    )
  }
  if (!straddles) return copy(portalSide(pose.position), "whole")

  return (
    <g>
      <defs>
        <clipPath id={`${clipId}-blue`}>
          <rect transform={poseTransform(pair.blue)} x={-500} y={-500} width={500} height={1000} />
        </clipPath>
        <clipPath id={`${clipId}-orange`}>
          <rect transform={poseTransform(pair.orange)} x={0} y={-500} width={500} height={1000} />
        </clipPath>
      </defs>
      {copy(-1, "blue", `${clipId}-blue`)}
      {copy(1, "orange", `${clipId}-orange`)}
    </g>
  )
}

/** Short x / y axes drawn at a reference frame's origin, labelled upright. */
function FrameAxes({ frame }: { frame: Pose }) {
  const length = 0.7
  const axis = (dir: Vec2, label: string, className: string) => {
    const tip = localToWorld(frame, { x: dir.x * length, y: dir.y * length })
    const at = localToWorld(frame, { x: dir.x * (length + 0.18), y: dir.y * (length + 0.18) })
    return (
      <g key={label}>
        <Arrow from={frame.position} to={tip} className={`${className} opacity-70`} />
        <Label at={at} anchor="middle" baseline="middle" className={`${className.split(" ")[0]} font-semibold`} size={FONT}>
          {label}
        </Label>
      </g>
    )
  }
  return (
    <g>
      {axis({ x: 1, y: 0 }, "x", "fill-chart-1 stroke-chart-1")}
      {axis({ x: 0, y: 1 }, "y", "fill-chart-2 stroke-chart-2")}
    </g>
  )
}

function Prop({ prop, time }: { prop: SceneProp; time: number }) {
  switch (prop.kind) {
    case "floor":
      return <Floor {...prop} />
    case "solid":
      return <Solid points={prop.points} />
    case "trapdoor":
      return <Trapdoor {...prop} time={time} />
    case "piston":
      return <Piston {...prop} time={time} />
    case "portal":
      return <Portal prop={prop} time={time} />
  }
}

const PORTAL_COLORS = { blue: "#4fb3ff", orange: "#ffa53a" } as const

/**
 * Portal seen edge-on: a solid line on the portal plane, with a glow fading
 * out towards `facing` to show which way the opening looks. Drawn facing
 * right, then turned into place.
 */
function Portal({ prop, time }: { prop: Extract<SceneProp, { kind: "portal" }>; time: number }) {
  const { height, color, facing } = prop
  const curves = useMemo(() => portalPathCurves(prop), [prop])
  const position = { x: evaluateCurve(curves.x, time), y: evaluateCurve(curves.y, time) }
  const stroke = PORTAL_COLORS[color]
  const glow = 0.6
  const id = useId()
  return (
    <g transform={poseTransform({ position, angle: FACING_ANGLE[facing] })}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={glow} y2={0}>
          <stop offset={0} stopColor={stroke} stopOpacity={0.55} />
          <stop offset={1} stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={0} y={-height / 2} width={glow} height={height} fill={`url(#${id})`} />
      <line x1={0} y1={-height / 2} x2={0} y2={height / 2} stroke={stroke} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </g>
  )
}

const INK = "stroke-[var(--blueprint-ink)]"

function Floor({ y, from, to }: { y: number; from: number; to: number }) {
  const depth = 0.6
  return (
    <g>
      <rect x={from} y={y - depth} width={to - from} height={depth} className="fill-[var(--blueprint-bg)]" />
      <rect x={from} y={y - depth} width={to - from} height={depth} fill="url(#floor-hatch)" />
      <line x1={from} y1={y} x2={to} y2={y} className={INK} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
    </g>
  )
}

function Solid({ points }: { points: Vec2[] }) {
  const d = points.map((p) => `${p.x},${p.y}`).join(" ")
  return (
    <g>
      <polygon points={d} className="fill-[var(--blueprint-bg)]" />
      <polygon points={d} fill="url(#floor-hatch)" className={INK} strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </g>
  )
}

function Trapdoor({
  position,
  width,
  open,
  time,
}: {
  position: Vec2
  width: number
  open: Parameters<typeof createCurve>[0]
  time: number
}) {
  const curve = useMemo(() => createCurve(open), [open])
  const angle = evaluateCurve(curve, time)
  const half = width / 2
  const thickness = 0.08
  const ledge = 0.5
  const door = (side: -1 | 1) => {
    // Hinge on the outer edge; the door swings down towards the outside.
    const hx = position.x + side * half
    return (
      <g transform={`rotate(${side * angle} ${hx} ${position.y})`}>
        <rect
          x={side === -1 ? hx : hx - half}
          y={position.y - thickness}
          width={half}
          height={thickness}
          className={`fill-[var(--blueprint-bg)] ${INK}`}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={hx} cy={position.y - thickness / 2} r={0.035} className="fill-[var(--blueprint-ink)]" />
      </g>
    )
  }
  return (
    <g>
      {/* fixed ledges either side of the opening */}
      {([-1, 1] as const).map((side) => (
        <rect
          key={side}
          x={side === -1 ? position.x - half - ledge : position.x + half}
          y={position.y - thickness * 2}
          width={ledge}
          height={thickness * 2}
          fill="url(#floor-hatch)"
          className={INK}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {door(-1)}
      {door(1)}
    </g>
  )
}

function Piston({
  position,
  width,
  extension,
  showBase = true,
  cutAbove,
  time,
}: {
  position: Vec2
  width: number
  extension: Parameters<typeof createCurve>[0]
  showBase?: boolean
  cutAbove?: Parameters<typeof createCurve>[0]
  time: number
}) {
  const curve = useMemo(() => createCurve(extension), [extension])
  const cutCurve = useMemo(() => (cutAbove?.length ? createCurve(cutAbove) : undefined), [cutAbove])
  const lift = evaluateCurve(curve, time)
  // Drawn region: above `position` only without a base, below the cut if any.
  const clipBottom = showBase ? position.y - 1e3 : position.y
  const clipTop = cutCurve ? evaluateCurve(cutCurve, time) : position.y + 1e3
  const clipped = !showBase || !!cutCurve
  const clipId = useId()
  const head = 0.15
  const rod = width * 0.3
  const well = 0.6 // depth of the recess in the floor, matches the floor's thickness
  const top = position.y + lift
  return (
    <g clipPath={clipped ? `url(#${clipId})` : undefined}>
      {/* without its base, only what is above `position` is drawn; nothing above the cut */}
      {clipped && (
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <rect x={position.x - width} y={clipBottom} width={width * 2} height={Math.max(0, clipTop - clipBottom)} />
          </clipPath>
        </defs>
      )}
      {/* recess in the floor the piston retracts into */}
      {showBase && <rect
        x={position.x - width / 2}
        y={position.y - well}
        width={width}
        height={well}
        className={`fill-[var(--blueprint-bg)] ${INK}`}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />}
      {/* rod */}
      <rect
        x={position.x - rod / 2}
        y={position.y - well}
        width={rod}
        height={Math.max(0, top - head - (position.y - well))}
        fill="url(#floor-hatch)"
        className={INK}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {/* head */}
      <rect
        x={position.x - width / 2}
        y={top - head}
        width={width}
        height={head}
        className={`fill-[var(--blueprint-bg)] ${INK}`}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  )
}

/** A world-space arrow; the head shrinks with the arrow so short vectors stay readable. */
function Arrow({ from, to, className }: { from: Vec2; to: Vec2; className?: string }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy)
  if (length < 0.02) return null
  const ux = dx / length
  const uy = dy / length
  const head = Math.min(0.14, length * 0.6)
  const base = { x: to.x - ux * head, y: to.y - uy * head }
  const half = head * 0.55
  return (
    <g className={className}>
      <line x1={from.x} y1={from.y} x2={base.x} y2={base.y} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <polygon
        points={`${to.x},${to.y} ${base.x - uy * half},${base.y + ux * half} ${base.x + uy * half},${base.y - ux * half}`}
        strokeWidth={0}
      />
    </g>
  )
}

function Label({
  at,
  children,
  className,
  size = FONT,
  anchor = "start",
  baseline = "auto",
}: {
  at: Vec2
  children: ReactNode
  className?: string
  size?: number
  anchor?: "start" | "middle" | "end"
  baseline?: "auto" | "middle" | "hanging"
}) {
  return (
    <text
      transform={`translate(${at.x} ${at.y}) scale(1 -1)`}
      fontSize={size}
      textAnchor={anchor}
      dominantBaseline={baseline}
      className={className}
      style={{ paintOrder: "stroke" }}
    >
      {children}
    </text>
  )
}
