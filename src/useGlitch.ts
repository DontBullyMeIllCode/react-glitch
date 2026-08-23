import { useEffect, useMemo, useRef } from "react"
import type { CSSProperties, ReactNode, RefObject } from "react"

import { glitchStyle, type GlitchVars } from "./glitch-vars.js"

export type UseGlitchOptions = GlitchVars & {
  /**
   * What the element renders. Plain strings are copied straight into the
   * channel layers. Anything else — a typewriter, split text, any component
   * that rewrites itself — is mirrored from the DOM instead, so the layers
   * track it as it changes.
   */
  children?: ReactNode
  /** Set false for base jitter and dropout only, with no colour split. */
  channels?: boolean
}

export type UseGlitchResult = {
  /** Attach to the glitched element so live children can be mirrored. */
  ref: RefObject<HTMLElement | null>
  /** The custom properties `glitch.css` reads its timing and colour from. */
  style: CSSProperties
  /** Copy for the channel layers, or `undefined` while it is mirrored. */
  "data-text": string | undefined
}

/**
 * Wires an element up to `glitch.css`: the custom properties that drive the
 * burst schedule, and the `data-text` the channel layers read their copy from.
 *
 * Returns props to spread onto the element. The variant class — `glitch-text`,
 * `glitch-icon` — stays with the component, so each can style its own layers.
 */
export function useGlitch(options: UseGlitchOptions = {}): UseGlitchResult {
  const {
    children,
    channels = true,
    loop,
    amount,
    split,
    offset,
    channelA,
    channelB,
  } = options

  const ref = useRef<HTMLElement>(null)
  const isPlainText = typeof children === "string"

  /**
   * The channel layers read their copy from `attr(data-text)`, which only
   * carries a string. Duplicating the children as real DOM instead would run
   * any animation and its callbacks three times over, so for live children the
   * attribute is kept in step with whatever they have currently rendered.
   *
   * Attributes are deliberately left out of the observer: writing `data-text`
   * back onto the observed node would otherwise retrigger it forever.
   */
  useEffect(() => {
    if (isPlainText || !channels) return

    const el = ref.current
    if (!el) return

    const sync = () => {
      const text = el.textContent ?? ""
      if (el.getAttribute("data-text") !== text) {
        el.setAttribute("data-text", text)
      }
    }

    sync()
    const observer = new MutationObserver(sync)
    observer.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [isPlainText, channels, children])

  const style = useMemo(
    () => glitchStyle({ loop, amount, split, offset, channelA, channelB }),
    [loop, amount, split, offset, channelA, channelB],
  )

  return {
    ref,
    style,
    "data-text": typeof children === "string" ? children : undefined,
  }
}
