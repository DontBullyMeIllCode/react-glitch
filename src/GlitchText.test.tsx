import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { GlitchText } from "./GlitchText.js"

const root = (c: HTMLElement) => c.querySelector(".glitch-text") as HTMLElement

describe("<GlitchText />", () => {
  it("renders a span carrying the variant class", () => {
    const { container } = render(<GlitchText>SIGNAL LOST</GlitchText>)
    expect(root(container).tagName).toBe("SPAN")
  })

  it("renders the element named by `as`", () => {
    const { container } = render(<GlitchText as="h1">SIGNAL LOST</GlitchText>)
    expect(root(container).tagName).toBe("H1")
  })

  it("merges a caller className with the variant class", () => {
    const { container } = render(
      <GlitchText className="tracking-wide">SIGNAL LOST</GlitchText>,
    )
    expect(root(container)).toHaveClass("glitch-text", "tracking-wide")
  })

  it("hands plain text straight to the channel layers", () => {
    const { container } = render(<GlitchText>SIGNAL LOST</GlitchText>)
    expect(root(container)).toHaveAttribute("data-text", "SIGNAL LOST")
  })

  it("drops the colour split and its mirroring when channels are off", () => {
    const { container } = render(
      <GlitchText channels={false}>
        <b>live</b>
      </GlitchText>,
    )
    expect(root(container)).toHaveClass("glitch-text--base-only")
    expect(root(container)).not.toHaveAttribute("data-text")
  })

  it("mirrors live children into data-text and keeps it in step", () => {
    const { container, rerender } = render(
      <GlitchText>
        <b>alpha</b>
      </GlitchText>,
    )
    expect(root(container)).toHaveAttribute("data-text", "alpha")

    rerender(
      <GlitchText>
        <b>beta</b>
      </GlitchText>,
    )
    expect(root(container)).toHaveAttribute("data-text", "beta")
  })

  it("writes the knobs onto the element as custom properties", () => {
    const { container } = render(
      <GlitchText loop="3s" channelA="red">
        SIGNAL LOST
      </GlitchText>,
    )
    expect(root(container).style.getPropertyValue("--glitch-loop")).toBe("3s")
    expect(root(container).style.getPropertyValue("--glitch-a")).toBe("red")
  })
})
