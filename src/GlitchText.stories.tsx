import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"

import { GlitchText } from "./GlitchText.js"
import { glitchArgTypes } from "./story-args.js"

const meta = {
  title: "Components/GlitchText",
  component: GlitchText,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Text that tears on a fixed burst schedule — no randomness and no animation loop in JavaScript, so the only runtime cost is the stylesheet.",
          "",
          "The colour channels are `::before` and `::after` reading `attr(data-text)`. A plain string is copied into that attribute directly; anything else is mirrored from the DOM by a `MutationObserver`, so a child that rewrites itself keeps its layers in step without being rendered three times over.",
          "",
          "**The effect is disabled under `prefers-reduced-motion: reduce`.** If these stories look static, that is the stylesheet honouring the setting, not a broken build.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    ...glitchArgTypes,
    children: {
      control: "text",
      description:
        "Text to tear. Strings are copied into `data-text`; anything else is mirrored from the DOM.",
    },
    as: {
      control: "select",
      options: ["span", "h1", "h2", "p", "div"],
      description: "Element to render, so it can sit inside a heading.",
      table: { defaultValue: { summary: "span" } },
    },
    channels: {
      control: "boolean",
      description:
        "Set false for base jitter and dropout only, with no colour split.",
      table: { defaultValue: { summary: "true" }, category: "Colour" },
    },
    className: {
      control: "text",
      description: "Merged with the variant class via `tailwind-merge`.",
    },
  },
  args: { children: "SIGNAL LOST" },
} satisfies Meta<typeof GlitchText>

export default meta
type Story = StoryObj<typeof meta>

/** Every knob at its stylesheet default. */
export const Default: Story = {}

/** A tear small enough to pass for a bad cable rather than a broken one. */
export const Subtle: Story = {
  args: { amount: "2%", split: "0.006em" },
}

/** The other end of the same two knobs. */
export const Heavy: Story = {
  args: { amount: "14%", split: "0.05em" },
}

/**
 * `channels={false}` keeps the jitter and the dropped bands but drops the
 * colour split — the version that survives on a background it has to match.
 */
export const BaseOnly: Story = {
  args: { channels: false },
}

/** The channels are just two colours, and nothing says they must be these two. */
export const CustomPalette: Story = {
  args: { channelA: "#7cff6b", channelB: "#ff9d00" },
}

/**
 * Two elements on the same schedule tear in lockstep, which reads as one
 * object rather than two. `offset` shifts the schedule to break that up —
 * compare the pair below against the two above it.
 */
export const NeighbouringOffsets: Story = {
  args: { children: "SIGNAL LOST" },
  render: (args) => (
    <div style={{ display: "grid", gap: "1.5rem", textAlign: "center" }}>
      <div style={{ opacity: 0.55, fontSize: "0.7rem", letterSpacing: "0.2em" }}>
        SAME SCHEDULE
      </div>
      <div style={{ display: "grid", gap: "0.4rem" }}>
        <GlitchText {...args}>NORTH ARRAY</GlitchText>
        <GlitchText {...args}>SOUTH ARRAY</GlitchText>
      </div>
      <div style={{ opacity: 0.55, fontSize: "0.7rem", letterSpacing: "0.2em" }}>
        OFFSET
      </div>
      <div style={{ display: "grid", gap: "0.4rem" }}>
        <GlitchText {...args}>NORTH ARRAY</GlitchText>
        <GlitchText {...args} offset="-1.7s">
          SOUTH ARRAY
        </GlitchText>
      </div>
    </div>
  ),
}

/**
 * It renders a `span` so it can sit inside a heading, but `as` will render the
 * heading itself when the whole line is meant to tear.
 */
export const AsHeading: Story = {
  args: { as: "h1", children: "SIGNAL LOST", amount: "8%" },
}

function Typewriter({ text, speed = 180 }: { text: string; speed?: number }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    // Runs past the end of the string, so the finished line holds before it restarts.
    const id = setInterval(() => setTick((t) => (t + 1) % (text.length + 10)), speed)
    return () => clearInterval(id)
  }, [text, speed])

  return <>{text.slice(0, Math.min(tick, text.length))}</>
}

/**
 * Children that rewrite themselves are mirrored rather than copied: the
 * observer keeps `data-text` in step with whatever is currently rendered, so
 * the channel layers track the typewriter without it running three times.
 *
 * Inspect the element — `data-text` changes on every keystroke.
 */
export const LiveChildren: Story = {
  args: { children: <Typewriter text="SIGNAL LOST" /> },
  argTypes: { children: { control: false } },
}
