"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type Playback = {
  time: number
  playing: boolean
  speed: number
  duration: number
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (t: number) => void
  setSpeed: (speed: number) => void
  restart: () => void
}

export function usePlayback(duration: number, loop: boolean, autoplay = true): Playback {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(autoplay)
  const [speed, setSpeed] = useState(1)
  const timeRef = useRef(0)

  const seek = useCallback(
    (t: number) => {
      const clamped = Math.min(duration, Math.max(0, t))
      timeRef.current = clamped
      setTime(clamped)
    },
    [duration],
  )

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = ((now - last) / 1000) * speed
      last = now
      let next = timeRef.current + dt
      if (next >= duration) {
        if (loop) next %= duration
        else {
          next = duration
          setPlaying(false)
        }
      }
      timeRef.current = next
      setTime(next)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, duration, loop])

  const play = useCallback(() => {
    // Pressing play at the end of a non-looping timeline starts over.
    if (timeRef.current >= duration) seek(0)
    setPlaying(true)
  }, [duration, seek])
  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause])
  const restart = useCallback(() => {
    seek(0)
    setPlaying(true)
  }, [seek])

  return { time, playing, speed, duration, play, pause, toggle, seek, setSpeed, restart }
}
