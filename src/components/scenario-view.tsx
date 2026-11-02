"use client"

import { useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { SceneRenderer } from "@/components/scene/scene-renderer"
import { PointGraphs } from "@/components/timeline/point-graphs"
import { Transport } from "@/components/timeline/transport"
import { ScenarioProgress } from "@/components/scenario-progress"
import { sampleScenario, trackedState } from "@/engine/scenario"
import { usePlayback } from "@/engine/use-playback"
import { getScenarioIndex, scenarios } from "@/scenarios"

export function ScenarioView({ slug }: { slug: string }) {
  const index = getScenarioIndex(slug)
  const scenario = scenarios[index]
  const playback = usePlayback(scenario.duration, scenario.loop)
  const samples = useMemo(() => sampleScenario(scenario), [scenario])
  const links = useMemo(() => scenarios.map(({ slug, title }) => ({ slug, title })), [])

  const { toggle, seek, pause, time } = playback
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("input, textarea, [role=slider], [role=combobox], [role=listbox]")) return
      if (e.code === "Space") {
        e.preventDefault()
        toggle()
      } else if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        e.preventDefault()
        pause()
        seek(time + (e.code === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 1 : 0.05))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle, seek, pause, time])

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* scene */}
      <section className="relative min-h-0 flex-[3] bg-[var(--blueprint-bg)]">
        <SceneRenderer scenario={scenario} time={playback.time} />
        <header className="pointer-events-none absolute top-4 left-4 max-w-md rounded-xl border bg-background/75 p-4 backdrop-blur">
          <div className="font-mono text-xs text-muted-foreground">
            Scenario {index + 1} / {scenarios.length}
          </div>
          <h1 className="mt-1 text-lg font-semibold">{scenario.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{scenario.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scenario.concepts.map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>
        </header>
      </section>

      {/* timeline */}
      <section className="flex min-h-0 flex-[2] flex-col gap-3 border-t bg-background p-4">
        <Transport playback={playback} />
        <div className="grid min-h-0 flex-1 auto-cols-fr grid-flow-col gap-3">
          {scenario.trackedPoints.map((p) => (
            <PointGraphs
              key={p.id}
              point={p}
              referenceLabel={scenario.reference.label}
              samples={samples}
              keyTimes={scenario.keyTimes}
              playback={playback}
              value={trackedState(scenario, playback.time, p)}
            />
          ))}
        </div>
      </section>

      <ScenarioProgress items={links} current={index} />
    </div>
  )
}
