import type { Meta, StoryObj } from "@storybook/react-vite"

import { GlitchIcon } from "./GlitchIcon.js"
import { GlitchText } from "./GlitchText.js"
import { glitchArgTypes } from "./story-args.js"

/**
 * Stroked with `currentColor`, as lucide and every icon set like it is — which
 * is what lets each channel layer be recoloured with nothing but `color`.
 */
function WarningIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

const meta = {
  title: "Components/GlitchIcon",
  component: GlitchIcon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "The glitch for things that are not text.",
          "",
          "`GlitchText` builds its channels from `attr(data-text)`, which an SVG cannot supply — an icon has no text to copy, so it would only ever get the base jitter. This variant clones its children into real channel layers instead, which is safe *precisely because the content is static*.",
          "",
          "Anything stateful or animated belongs in `GlitchText`, which mirrors rather than duplicates: cloning it would run it, and its callbacks, three times over. The duplicated layers are `aria-hidden`, so the content is announced once.",
          "",
          "**`--glitch-split` defaults to `0.7%` here** rather than the text variant's `em`, since an icon's box has no meaningful relationship to font-size.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    ...glitchArgTypes,
    children: {
      control: false,
      description:
        "Static markup — an icon, a badge. Rendered three times, so nothing stateful belongs here.",
    },
    className: { control: "text", description: "Class for the wrapper." },
  },
  args: { children: <WarningIcon /> },
} satisfies Meta<typeof GlitchIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The separation is a percentage of the icon's own box, so it holds its
 * proportion across sizes — an `em` would vanish on the large one and
 * overwhelm the small one.
 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "2rem" }}>
      {[16, 24, 48, 96].map((size) => (
        <GlitchIcon {...args} key={size}>
          <WarningIcon size={size} />
        </GlitchIcon>
      ))}
    </div>
  ),
}

/** Widen the split and the three layers stop reading as one object. */
export const WideSplit: Story = {
  args: { split: "4%", amount: "10%" },
}

/**
 * The README's opening example: an icon and a line of text in one heading.
 * They take different `offset` values so they do not tear in unison.
 */
export const WithText: Story = {
  render: (args) => (
    <h1
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        margin: 0,
        fontSize: "inherit",
        fontWeight: 600,
      }}
    >
      <GlitchIcon {...args}>
        <WarningIcon size={32} />
      </GlitchIcon>
      <GlitchText amount="8%" offset="-2.4s">
        SIGNAL LOST
      </GlitchText>
    </h1>
  ),
}
