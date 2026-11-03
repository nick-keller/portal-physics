"use client"

import { useEffect, useMemo, useState } from "react"
import { Info, Minimize2, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SceneRenderer } from "@/components/scene/scene-renderer"
import { PointGraphs } from "@/components/timeline/point-graphs"
import { Transport } from "@/components/timeline/transport"
import { ScenarioProgress } from "@/components/scenario-progress"
import { ShareDialog } from "@/components/share-dialog"
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

  // On the last scenario, invite the user to share once the animation has played to the end.
  const isLast = index === scenarios.length - 1
  const finished = isLast && !scenario.loop && !playback.playing && time >= scenario.duration
  const [shareOpen, setShareOpen] = useState(false)
  const [shareShown, setShareShown] = useState(false)
  const [infoCollapsed, setInfoCollapsed] = useState(false)
  if (finished && !shareShown) {
    setShareShown(true)
    setShareOpen(true)
  }

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
        {infoCollapsed && (
          <button
            type="button"
            onClick={() => setInfoCollapsed(false)}
            aria-label="Show scenario explanation"
            className="fixed top-3 left-3 z-40 flex size-11 items-center justify-center rounded-full border bg-background/75 shadow-sm backdrop-blur md:hidden"
          >
            <Info className="size-5" />
          </button>
        )}
        <header
          className={`pointer-events-none fixed top-3 right-3 left-3 z-40 rounded-xl border bg-background/75 p-4 backdrop-blur md:absolute md:top-4 md:right-auto md:left-4 md:z-auto md:block md:max-w-md ${
            infoCollapsed ? "hidden" : ""
          }`}
        >
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
          {isLast && (
            <Button
              onClick={() => setShareOpen(true)}
              className="pointer-events-auto mt-3 bg-orange-500 text-white hover:bg-orange-600"
            >
              <Share2 />
              Share the demo
            </Button>
          )}
          <div className="mt-3 flex justify-end md:hidden">
            <button
              type="button"
              onClick={() => setInfoCollapsed(true)}
              aria-label="Collapse scenario explanation"
              className="pointer-events-auto flex size-11 items-center justify-center rounded-full border bg-background shadow-sm"
            >
              <Minimize2 className="size-5" />
            </button>
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
      {isLast && <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />}
    </div>
  )
}
