import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { GlitchImage } from "./GlitchImage.js"

const root = (c: HTMLElement) => c.querySelector(".glitch-image") as HTMLElement
const copies = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLElement>(".glitch-image__img"))
const channels = (c: HTMLElement) =>
  Array.from(c.querySelectorAll(".glitch-image__channel"))

/*
 * Shaped like next/image: required width and height it renders itself. Using it
 * here means `npm run typecheck` covers the generic as well as the markup.
 */
function NextishImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-optimised="true"
    />
  )
}

describe("<GlitchImage />", () => {
  it("renders a plain img in three layers by default", () => {
    const { container } = render(<GlitchImage src="/a.png" alt="a wreck" />)

    expect(copies(container)).toHaveLength(3)
    for (const img of copies(container)) {
      expect(img.tagName).toBe("IMG")
      expect(img).toHaveAttribute("src", "/a.png")
    }
  })

  it("renders whatever component `as` names, forwarding its own props", () => {
    const { container } = render(
      <GlitchImage as={NextishImage} src="/a.png" alt="a wreck" width={640} height={480} />,
    )

    const imgs = copies(container)
    expect(imgs).toHaveLength(3)
    for (const img of imgs) {
      expect(img).toHaveAttribute("data-optimised", "true")
      expect(img).toHaveAttribute("width", "640")
      expect(img).toHaveAttribute("height", "480")
    }
  })

  it("forwards arbitrary image attributes to every copy", () => {
    const { container } = render(
      <GlitchImage src="/a.png" alt="a wreck" loading="lazy" decoding="async" />,
    )

    for (const img of copies(container)) {
      expect(img).toHaveAttribute("loading", "lazy")
      expect(img).toHaveAttribute("decoding", "async")
    }
  })

  it("hides the duplicated layers from assistive technology", () => {
    const { container } = render(<GlitchImage src="/a.png" alt="a wreck" />)

    expect(channels(container)).toHaveLength(2)
    for (const layer of channels(container)) {
      expect(layer).toHaveAttribute("aria-hidden", "true")
    }
    expect(
      root(container).querySelector(".glitch-image__base"),
    ).not.toHaveAttribute("aria-hidden")
  })

  it("announces the image exactly once despite the three copies", () => {
    const { container } = render(<GlitchImage src="/a.png" alt="a wreck" />)

    const announced = copies(container).filter(
      (img) => !img.closest("[aria-hidden]"),
    )
    expect(announced).toHaveLength(1)
    expect(announced[0]).toHaveAttribute("alt", "a wreck")
  })

  it("sends className to the wrapper and imageClassName to each copy", () => {
    const { container } = render(
      <GlitchImage
        src="/a.png"
        alt="a wreck"
        className="w-64"
        imageClassName="object-cover"
      />,
    )

    expect(root(container)).toHaveClass("glitch-image", "w-64")
    expect(root(container)).not.toHaveClass("object-cover")
    for (const img of copies(container)) {
      expect(img).toHaveClass("glitch-image__img", "object-cover")
    }
  })

  it("writes the knobs onto the wrapper as custom properties", () => {
    const { container } = render(
      <GlitchImage src="/a.png" alt="a wreck" loop="2s" channelA="red" />,
    )
    const { style } = root(container)

    expect(style.getPropertyValue("--glitch-loop")).toBe("2s")
    expect(style.getPropertyValue("--glitch-a")).toBe("red")
  })

  it("leaves the split to the stylesheet when it is not set", () => {
    const { container } = render(<GlitchImage src="/a.png" alt="a wreck" />)
    expect(root(container).style.getPropertyValue("--glitch-split")).toBe("")
  })
})
