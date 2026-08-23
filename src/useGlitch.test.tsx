import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useGlitch } from "./useGlitch.js"

const vars = (style: object) => style as Record<string, string>

describe("useGlitch", () => {
  it("sets no custom properties when nothing is configured", () => {
    const { result } = renderHook(() => useGlitch())
    expect(Object.keys(result.current.style)).toHaveLength(0)
  })

  it("maps each knob onto its custom property", () => {
    const { result } = renderHook(() =>
      useGlitch({
        loop: "3s",
        amount: "9%",
        split: "0.05em",
        offset: "1.2s",
        channelA: "red",
        channelB: "blue",
      }),
    )

    expect(vars(result.current.style)).toEqual({
      "--glitch-loop": "3s",
      "--glitch-amount": "9%",
      "--glitch-split": "0.05em",
      "--glitch-offset": "1.2s",
      "--glitch-a": "red",
      "--glitch-b": "blue",
    })
  })

  it("omits custom properties for knobs left unset", () => {
    const { result } = renderHook(() => useGlitch({ loop: "3s" }))
    expect(vars(result.current.style)).toEqual({ "--glitch-loop": "3s" })
  })

  it("keeps the style object stable while the knobs do not change", () => {
    const { result, rerender } = renderHook(
      ({ loop }) => useGlitch({ loop }),
      { initialProps: { loop: "3s" } },
    )

    const first = result.current.style
    rerender({ loop: "3s" })
    expect(result.current.style).toBe(first)

    rerender({ loop: "4s" })
    expect(result.current.style).not.toBe(first)
  })

  it("passes plain string children through as data-text", () => {
    const { result } = renderHook(() => useGlitch({ children: "SIGNAL LOST" }))
    expect(result.current["data-text"]).toBe("SIGNAL LOST")
  })

  it("leaves data-text unset for children it has to mirror", () => {
    const { result } = renderHook(() => useGlitch({ children: <b>live</b> }))
    expect(result.current["data-text"]).toBeUndefined()
  })
})
