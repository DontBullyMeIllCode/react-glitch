import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"

import { useGlitch, type UseGlitchOptions } from "./useGlitch.js"
import { glitchArgTypes } from "./story-args.js"
import "./glitch.css"

/**
 * The README's worked example: a badge that owns its own box and borrows the
 * glitch wiring. The variant class stays with the component, so a variant can
 * style its own layers.
 */
function GlitchBadge({
  children,
  ...options
}: UseGlitchOptions & { children: ReactNode }) {
  const glitch = useGlitch({ children, ...options })

  return (
    <span
      {...glitch}
      className="glitch-text"
      style={{
        ...glitch.style,
        border: "1px solid currentColor",
        borderRadius: "999px",
        padding: "0.35em 0.9em",
        fontSize: "0.8rem",
        letterSpacing: "0.18em",
      }}
    >
      {children}
    </span>
  )
}

const meta = {
  title: "Hooks/useGlitch",
  component: GlitchBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "The wiring behind `<GlitchText>`, for building your own glitched element. It returns props to spread: `ref` (attach it so live children can be mirrored), `style` (the custom properties the stylesheet reads) and `data-text` (copy for the channel layers, `undefined` while it is mirrored).",
          "",
          "The variant class stays with the component rather than coming out of the hook, so each variant styles its own layers — the badge below reuses `.glitch-text` and adds a box of its own.",
          "",
          "A variant that carries its own copies — as `GlitchIcon` and `GlitchImage` do — can take `style` alone and leave the ref unattached, which keeps the mirroring inert.",
          "",
          "Note that a consumer of the published package must import the stylesheet once, near their app entry: `import '@dontbullymeillcode/react-glitch/styles.css'`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    ...glitchArgTypes,
    children: { control: "text" },
    channels: {
      control: "boolean",
      table: { defaultValue: { summary: "true" }, category: "Colour" },
    },
  },
  args: { children: "UPLINK DOWN" },
} satisfies Meta<typeof GlitchBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Badge: Story = {}

/** Same hook, same stylesheet, a palette that suits the box it is in. */
export const TunedBadge: Story = {
  args: { channelA: "#ffd166", channelB: "#ef476f", amount: "4%", loop: "3.4s" },
}

/** Without the channels it is the jitter and the dropped bands alone. */
export const BaseOnlyBadge: Story = {
  args: { channels: false },
}
