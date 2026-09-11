import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentPropsWithoutRef } from "react"

import { GlitchImage, type GlitchImageProps } from "./GlitchImage.js"
import { glitchArgTypes } from "./story-args.js"

/*
 * Inlined rather than committed as a binary, so the stories carry no asset and
 * no network call. An `<img>` treats it as any other bitmap — which is the
 * point, since the channels blend the rendered image, not its markup.
 */
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#160b2e"/>
      <stop offset="0.55" stop-color="#4a1350"/>
      <stop offset="1" stop-color="#0b0713"/>
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe66b"/>
      <stop offset="0.5" stop-color="#ff8a3d"/>
      <stop offset="1" stop-color="#ff2e6a"/>
    </linearGradient>
    <clipPath id="disc"><circle cx="240" cy="190" r="110"/></clipPath>
  </defs>
  <rect width="480" height="320" fill="url(#sky)"/>
  <g clip-path="url(#disc)">
    <rect x="130" y="80" width="220" height="220" fill="url(#sun)"/>
    <g fill="#0b0713" opacity="0.85">
      <rect x="130" y="196" width="220" height="6"/>
      <rect x="130" y="212" width="220" height="9"/>
      <rect x="130" y="232" width="220" height="12"/>
      <rect x="130" y="258" width="220" height="16"/>
    </g>
  </g>
  <rect x="0" y="236" width="480" height="84" fill="#0b0713"/>
  <rect x="0" y="234" width="480" height="2" fill="#ff2e6a" opacity="0.6"/>
</svg>`

const SUN = `data:image/svg+xml,${encodeURIComponent(SCENE)}`

const meta: Meta<GlitchImageProps<"img">> = {
  title: "Components/GlitchImage",
  component: GlitchImage,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "The glitch for bitmaps.",
          "",
          "Like `GlitchIcon` this clones its children into real channel layers, since an image has no text for `attr(data-text)` to copy. Unlike the icon it cannot be recoloured with `color` — that only works because an icon strokes with `currentColor` — so each channel multiplies its colour out of its own copy of the bitmap, keeping only the light that colour lets through, and the copies are screened back over the base.",
          "",
          "The image component is yours to choose via `as`, so the host framework keeps its own loading, sizing and optimisation behaviour. Whatever you pass has its own props type-checked and forwarded to every layer, so a missing `width` on `next/image` is still a compile error.",
          "",
          "**Three copies are rendered.** Fine for a cached static asset; not the place for anything with a side effect on render. The duplicated layers are `aria-hidden`, so the image is announced once.",
          "",
          "The screen blending is what puts the channels back over the base, so it reads differently against a light backdrop — flip the **Surface** toolbar control to see it.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    ...glitchArgTypes,
    as: {
      control: false,
      description: "The image component to render.",
      table: { defaultValue: { summary: '"img"' } },
    },
    className: {
      control: "text",
      description: "Class for the wrapper that carries the effect.",
    },
    imageClassName: {
      control: "text",
      description: "Class for each copy of the image, since `className` is spoken for.",
    },
  },
  args: {
    src: SUN,
    alt: "A banded sun setting behind a horizon",
    width: 480,
    height: 320,
  },
}

export default meta
type Story = StoryObj<GlitchImageProps<"img">>

export const Default: Story = {}

/** Enough separation to see the multiply and the screen doing their work. */
export const WideSplit: Story = {
  args: { split: "3%", amount: "12%" },
}

/** The channels are only two colours here too, whatever the bitmap's own palette. */
export const CustomPalette: Story = {
  args: { channelA: "#00ff9d", channelB: "#ff0040", split: "2%" },
}

/** Slower cycle, wider tear — closer to a failing feed than a passing fault. */
export const SlowAndViolent: Story = {
  args: { loop: "9s", amount: "18%", split: "2.5%" },
}

/**
 * A stand-in for `next/image` or a CDN wrapper: whatever `as` receives has its
 * props checked and forwarded to all three layers. `className` is taken by the
 * wrapper, so the copies are styled through `imageClassName` instead.
 */
function FramedImage({ style, ...props }: ComponentPropsWithoutRef<"img">) {
  return (
    <img
      {...props}
      style={{ ...style, borderRadius: "0.75rem", display: "block" }}
    />
  )
}

export const CustomImageComponent: Story = {
  render: (args) => <GlitchImage {...args} as={FramedImage} />,
}
