"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Check, Copy, Share2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-metadata"

const SHARE_DATA: ShareData = {
  title: SITE_NAME,
  text: SITE_DESCRIPTION,
  url: SITE_URL,
}

const noopSubscribe = () => () => {}
const detectShare = () => typeof navigator.share === "function" && (navigator.canShare?.(SHARE_DATA) ?? true)

export function ShareDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [copied, setCopied] = useState(false)
  // navigator.share only exists in the browser (and not everywhere): false on the server.
  const canShare = useSyncExternalStore(noopSubscribe, detectShare, () => false)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL)
    } catch {
      return
    }
    setCopied(true)
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  const share = async () => {
    try {
      await navigator.share(SHARE_DATA)
    } catch {
      // User dismissed the share sheet, nothing to do.
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/40 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[28rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-background text-foreground shadow-2xl outline-none transition-[scale,opacity,translate] duration-300 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+1rem)] data-starting-style:scale-95 data-starting-style:opacity-0">
          {/* portal-colored glow header */}
          <div className="relative flex h-28 items-center justify-center overflow-hidden bg-[var(--blueprint-bg)]">
            <div className="absolute -left-10 size-40 rounded-full bg-sky-500/50 blur-3xl" />
            <div className="absolute -right-10 size-40 rounded-full bg-orange-500/50 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <span className="h-16 w-4 rounded-[50%] bg-sky-400 shadow-[0_0_24px_6px] shadow-sky-400/60" />
              <Sparkles className="size-7 text-white drop-shadow" />
              <span className="h-16 w-4 rounded-[50%] bg-orange-400 shadow-[0_0_24px_6px] shadow-orange-400/60" />
            </div>
          </div>

          <Dialog.Close
            render={<Button variant="ghost" size="icon-sm" />}
            className="absolute top-3 right-3 text-white hover:bg-white/15 hover:text-white"
            aria-label="Close"
          >
            <X />
          </Dialog.Close>

          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-1.5 text-center">
              <Dialog.Title className="text-xl font-semibold">You made it through every portal!</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                Know someone who&apos;d argue about whether the cube gets launched? Send them the demo and let them figure
                it out too.
              </Dialog.Description>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-1.5 pl-3">
              <span className="min-w-0 flex-1 truncate font-mono text-sm select-all">{SITE_URL}</span>
              <Button variant={copied ? "secondary" : "outline"} onClick={copy} aria-live="polite">
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            {canShare && (
              <Button size="lg" onClick={share} className="w-full">
                <Share2 />
                Share
              </Button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
