"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ScenarioLink = { slug: string; title: string };

/** Bottom timeline of scenarios: one circle per scenario, linked by a progress line. */
export function ScenarioProgress({
  items,
  current,
}: {
  items: ScenarioLink[];
  current: number;
}) {
  const prev = items[current - 1];
  const next = items[current + 1];
  const progress = items.length > 1 ? current / (items.length - 1) : 1;
  // On the first scenario, point at the next step to invite the user forward.
  const hintIndex = current === 0 && items.length > 1 ? 1 : -1;
  // Wait for roughly one run of the scene animation before showing the hint.
  const [hintVisible, setHintVisible] = useState(false);
  useEffect(() => {
    if (hintIndex < 0) return;
    const id = setTimeout(() => setHintVisible(true), 3500);
    return () => clearTimeout(id);
  }, [hintIndex]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLAnchorElement>(null);

  // When the timeline overflows (mobile), keep the current scenario centered.
  useEffect(() => {
    const container = scrollRef.current;
    const el = currentRef.current;
    if (!container || !el) return;
    container.scrollLeft =
      el.offsetLeft + el.offsetWidth / 2 - container.clientWidth / 2;
  }, [current]);

  return (
    <nav
      className="flex items-center gap-4 border-t bg-background/80 px-4 py-3"
      aria-label="Scenarios"
    >
      <NavButton item={prev} direction="prev" />

      <div
        ref={scrollRef}
        className={cn(
          "min-w-0 flex-1 overflow-x-auto overscroll-x-contain py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Extra top room for the hint arrow, pulled up so the nav height is unchanged.
          hintIndex >= 0 && "pointer-events-none -mt-17 pt-18.5",
        )}
      >
        <div className="pointer-events-auto relative flex w-full min-w-max items-center justify-between gap-6 px-2">
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
                    ref={i === current ? currentRef : undefined}
                    href={`/${item.slug}`}
                    aria-current={i === current ? "step" : undefined}
                    className={cn(
                      "relative z-10 flex size-7 items-center justify-center rounded-full border-2 font-mono text-xs transition-colors",
                      i < current &&
                        "border-primary bg-primary text-primary-foreground",
                      i === current &&
                        "border-primary bg-background text-primary ring-4 ring-primary/25",
                      i > current &&
                        "border-border bg-background text-muted-foreground hover:border-primary/60",
                    )}
                  />
                }
              >
                {i + 1}
                {i === hintIndex && hintVisible && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-full mb-1 flex flex-col items-center"
                  >
                    <span className="text-sm font-medium whitespace-nowrap text-orange-500">
                      Next scenario
                    </span>
                    <ArrowDownIcon
                      strokeWidth={3}
                      className="size-10 shrink-0 text-orange-500 motion-safe:animate-[next-hint_1s_ease-in-out_infinite]"
                    />
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>{item.title}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <NavButton item={next} direction="next" />
    </nav>
  );
}

function NavButton({
  item,
  direction,
}: {
  item?: ScenarioLink;
  direction: "prev" | "next";
}) {
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  const label = direction === "prev" ? "Previous scenario" : "Next scenario";
  if (!item)
    return (
      <Button size="icon" variant="outline" disabled aria-label={label}>
        <Icon />
      </Button>
    );
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
  );
}
