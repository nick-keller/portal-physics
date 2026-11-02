"use client"

import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type ScenarioLink = { slug: string; title: string }

/** Bottom timeline of scenarios: one circle per scenario, linked by a progress line. */
export function ScenarioProgress({ items, current }: { items: ScenarioLink[]; current: number }) {
  const prev = items[current - 1]
  const next = items[current + 1]
  const progress = items.length > 1 ? current / (items.length - 1) : 1

  return (
    <nav className="flex items-center gap-4 border-t bg-background/80 px-4 py-3" aria-label="Scenarios">
      <NavButton item={prev} direction="prev" />

      <div className="relative flex flex-1 items-center justify-between px-2">
        <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 left-4 h-0.5 -translate-y-1/2 rounded-full bg-primary transition-[width]"
          style={{ width: `calc((100% - 2rem) * ${progress})` }}
        />
        {items.map((item, i) => (
          <Tooltip key={item.slug}>
            <TooltipTrigger
              render={
                <Link
                  href={`/${item.slug}`}
                  aria-current={i === current ? "step" : undefined}
                  className={cn(
                    "relative z-10 flex size-7 items-center justify-center rounded-full border-2 font-mono text-xs transition-colors",
                    i < current && "border-primary bg-primary text-primary-foreground",
                    i === current && "border-primary bg-background text-primary ring-4 ring-primary/25",
                    i > current && "border-border bg-background text-muted-foreground hover:border-primary/60",
                  )}
                />
              }
            >
              {i + 1}
            </TooltipTrigger>
            <TooltipContent>{item.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <NavButton item={next} direction="next" />
    </nav>
  )
}

function NavButton({ item, direction }: { item?: ScenarioLink; direction: "prev" | "next" }) {
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon
  const label = direction === "prev" ? "Previous scenario" : "Next scenario"
  if (!item)
    return (
      <Button size="icon" variant="outline" disabled aria-label={label}>
        <Icon />
      </Button>
    )
  return (
    <Button
      size="icon"
      variant="outline"
      aria-label={label}
      nativeButton={false}
      render={<Link href={`/${item.slug}`} />}
    >
      <Icon />
    </Button>
  )
}
