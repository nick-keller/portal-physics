"use client"

import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Playback } from "@/engine/use-playback"

const SPEEDS = [0.1, 0.25, 0.5, 1, 2, 4].map((s) => ({ value: String(s), label: `${s}×` }))

export function Transport({ playback }: { playback: Playback }) {
  const { time, duration, playing, speed } = playback
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button size="icon" onClick={playback.toggle} aria-label={playing ? "Pause" : "Play"} />
          }
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </TooltipTrigger>
        <TooltipContent>{playing ? "Pause" : "Play"} (space)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={<Button size="icon" variant="ghost" onClick={playback.restart} aria-label="Restart" />}
        >
          <RotateCcwIcon />
        </TooltipTrigger>
        <TooltipContent>Restart</TooltipContent>
      </Tooltip>

      <span className="w-28 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
        {time.toFixed(2)} / {duration.toFixed(2)} s
      </span>

      <Slider
        className="mx-2 flex-1"
        min={0}
        max={duration}
        step={0.01}
        value={[time]}
        onValueChange={(v) => playback.seek(Array.isArray(v) ? v[0] : v)}
        aria-label="Time"
      />

      <Select
        items={SPEEDS}
        value={String(speed)}
        onValueChange={(v) => v && playback.setSpeed(Number(v))}
      >
        <SelectTrigger size="sm" className="w-20" aria-label="Playback speed">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPEEDS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
