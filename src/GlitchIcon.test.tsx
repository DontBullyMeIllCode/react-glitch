import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { GlitchIcon } from "./GlitchIcon.js"

const root = (c: HTMLElement) => c.querySelector(".glitch-icon") as HTMLElement
const channels = (c: HTMLElement) =>
  Array.from(c.querySelectorAll(".glitch-icon__channel"))

describe("<GlitchIcon />", () => {
  it("clones the children into a base layer and two channel layers", () => {
    const { container } = render(
      <GlitchIcon>
        <svg data-testid="mark" />
      </GlitchIcon>,
    )

    expect(container.querySelectorAll('[data-testid="mark"]')).toHaveLength(3)
    expect(root(container).querySelector(".glitch-icon__base")).toBeInTheDocument()
    expect(channels(container)).toHaveLength(2)
  })

  it("gives the two channel layers their own colour classes", () => {
    const { container } = render(
      <GlitchIcon>
        <svg />
      </GlitchIcon>,
    )
    const [a, b] = channels(container)

    expect(a).toHaveClass("glitch-icon__channel--a")
    expect(b).toHaveClass("glitch-icon__channel--b")
  })

  it("hides the duplicated layers from assistive technology", () => {
    const { container } = render(
      <GlitchIcon>
        <svg />
      </GlitchIcon>,
    )

    for (const layer of channels(container)) {
      expect(layer).toHaveAttribute("aria-hidden", "true")
    }
    expect(
      root(container).querySelector(".glitch-icon__base"),
    ).not.toHaveAttribute("aria-hidden")
  })

  it("merges a caller className with the variant class", () => {
    const { container } = render(
      <GlitchIcon className="size-6">
        <svg />
      </GlitchIcon>,
    )
    expect(root(container)).toHaveClass("glitch-icon", "size-6")
  })

  it("writes the knobs onto the element as custom properties", () => {
    const { container } = render(
      <GlitchIcon loop="2s" split="1.4%" channelB="lime">
        <svg />
      </GlitchIcon>,
    )
    const { style } = root(container)

    expect(style.getPropertyValue("--glitch-loop")).toBe("2s")
    expect(style.getPropertyValue("--glitch-split")).toBe("1.4%")
    expect(style.getPropertyValue("--glitch-b")).toBe("lime")
  })

  it("leaves the split to the stylesheet when it is not set", () => {
    const { container } = render(
      <GlitchIcon>
        <svg />
      </GlitchIcon>,
    )
    expect(root(container).style.getPropertyValue("--glitch-split")).toBe("")
  })

  it("never writes a data-text attribute", () => {
    const { container } = render(<GlitchIcon>plain</GlitchIcon>)
    expect(root(container)).not.toHaveAttribute("data-text")
  })
})
