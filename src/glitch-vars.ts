import type { CSSProperties } from "react"

/** Knobs shared by every glitch variant, mapped onto CSS custom properties. */
export type GlitchVars = {
  /** One full cycle. Four bursts are baked into it. Default "5.2s". */
  loop?: string
  /** Furthest a torn slice slides sideways. */
  amount?: string
  /** Colour-channel separation. */
  split?: string
  /** Shifts the burst schedule, so neighbours do not tear in unison. */
  offset?: string
  /** Channel colours. Default the scene's cyan and magenta. */
  channelA?: string
  channelB?: string
}

export function glitchStyle({
  loop,
  amount,
  split,
  offset,
  channelA,
  channelB,
}: GlitchVars): CSSProperties {
  return {
    ...(loop && { "--glitch-loop": loop }),
    ...(amount && { "--glitch-amount": amount }),
    ...(split && { "--glitch-split": split }),
    ...(offset && { "--glitch-offset": offset }),
    ...(channelA && { "--glitch-a": channelA }),
    ...(channelB && { "--glitch-b": channelB }),
  } as CSSProperties
}
