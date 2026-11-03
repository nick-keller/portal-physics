"use client"

import { memo, useMemo, useRef } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { trackedSeries, type Sample, type Series, type TrackedPoint } from "@/engine/scenario"
import type { Playback } from "@/engine/use-playback"
import { formatNumber } from "@/lib/utils"

/** Plot-area insets; the cursor overlay relies on these matching the chart layout. */
const MARGIN = { top: 6, right: 12, bottom: 0, left: 0 }
const Y_AXIS_WIDTH = 36
const X_AXIS_HEIGHT = 18
const PLOT_INSET = {
  top: MARGIN.top,
  right: MARGIN.right,
  bottom: MARGIN.bottom + X_AXIS_HEIGHT,
  left: MARGIN.left + Y_AXIS_WIDTH,
}

export const SERIES: Record<Series, { label: string; unit: string; color: string }> = {
  x: { label: "x", unit: "", color: "var(--chart-1)" },
  y: { label: "y", unit: "", color: "var(--chart-2)" },
  vx: { label: "vx", unit: "/s", color: "var(--chart-3)" },
  vy: { label: "vy", unit: "/s", color: "var(--chart-4)" },
}

/** One card per tracked point, with one graph per tracked series (x(t), y(t), vy(t)…). */
export function PointGraphs({
  point,
  referenceLabel,
  samples,
  keyTimes,
  playback,
  value,
}: {
  point: TrackedPoint
  referenceLabel: string
  samples: Sample[]
  keyTimes: number[]
  playback: Playback
  value: Record<Series, number>
}) {
  const series = trackedSeries(point)
  return (
    <div className="flex min-h-0 min-w-0 flex-col rounded-xl border bg-card/60 p-3">
      <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-chart-3" />
          <span className="font-medium">{point.label}</span>
          <span className="text-muted-foreground">relative to {referenceLabel}</span>
        </div>
        <div className="font-mono tabular-nums">
          {series.map((s) => (
            <span key={s} className="ml-3" style={{ color: SERIES[s].color }}>
              {SERIES[s].label} {formatNumber(value[s])}
              {SERIES[s].unit}
            </span>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        {series.map((s) => (
          <SeriesGraph
            key={s}
            series={s}
            dataKey={`${point.id}.${s}`}
            samples={samples}
            keyTimes={keyTimes}
            playback={playback}
          />
        ))}
      </div>
    </div>
  )
}

function SeriesGraph({
  series,
  dataKey,
  samples,
  keyTimes,
  playback,
}: {
  series: Series
  dataKey: string
  samples: Sample[]
  keyTimes: number[]
  playback: Playback
}) {
  const { time, duration } = playback
  return (
    <div className="relative min-h-0 flex-1">
      <span
        className="pointer-events-none absolute top-0 right-4 z-10 font-mono text-[11px] font-semibold"
        style={{ color: SERIES[series].color }}
      >
        {SERIES[series].label}
        {SERIES[series].unit && <span className="opacity-60"> (units{SERIES[series].unit})</span>}
      </span>
      <StaticChart series={series} dataKey={dataKey} samples={samples} keyTimes={keyTimes} duration={duration} />
      <Scrubber playback={playback}>
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-foreground"
          style={{ left: `${(time / duration) * 100}%` }}
        />
      </Scrubber>
    </div>
  )
}

/** The chart itself never changes during playback, so it is memoised and only the cursor moves. */
const StaticChart = memo(function StaticChart({
  series,
  dataKey,
  samples,
  keyTimes,
  duration,
}: {
  series: Series
  dataKey: string
  samples: Sample[]
  keyTimes: number[]
  duration: number
}) {
  const config = { [series]: SERIES[series] } satisfies ChartConfig
  const domain = useMemo(() => {
    const values = samples.map((s) => s[dataKey])
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max(0.5, (max - min) * 0.1)
    return [Math.floor(min - pad), Math.ceil(max + pad)]
  }, [samples, dataKey])
  return (
    <ChartContainer config={config} className="aspect-auto size-full">
      <LineChart data={samples} margin={MARGIN} accessibilityLayer={false}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeOpacity={0.4} />
        {keyTimes.map((t) => (
          <ReferenceLine key={t} x={t} stroke="var(--chart-5)" strokeOpacity={0.35} strokeDasharray="2 3" />
        ))}
        <XAxis
          dataKey="t"
          type="number"
          domain={[0, duration]}
          ticks={keyTimes}
          tickFormatter={(t: number) => `${+t.toFixed(2)}s`}
          height={X_AXIS_HEIGHT}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
        />
        <YAxis
          width={Y_AXIS_WIDTH}
          domain={domain}
          tickLine={false}
          axisLine={false}
          tickCount={3}
          tickFormatter={(v: number) => formatNumber(v, 1)}
        />
        <Line
          // Function accessor: string keys containing dots are read as nested paths.
          dataKey={(s: Sample) => s[dataKey]}
          name={SERIES[series].label}
          type="linear"
          stroke={SERIES[series].color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
})

/** Transparent overlay on the plot area: click or drag to move the time cursor. */
function Scrubber({ playback, children }: { playback: Playback; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const resumeRef = useRef(false)

  const seekFromEvent = (e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    playback.seek(ratio * playback.duration)
  }

  return (
    <div
      ref={ref}
      className="absolute cursor-ew-resize touch-none"
      style={PLOT_INSET}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        resumeRef.current = playback.playing
        playback.pause()
        seekFromEvent(e)
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) seekFromEvent(e)
      }}
      onPointerUp={() => {
        if (resumeRef.current) playback.play()
      }}
    >
      {children}
    </div>
  )
}
