import type { ArgTypes } from "@storybook/react-vite"

import type { GlitchVars } from "./glitch-vars.js"

/**
 * Controls for the knobs every variant shares.
 *
 * Not part of the published surface — `src/index.ts` never reaches this file,
 * so it stays out of `dist` — it just keeps three story files from repeating
 * the same seven descriptions.
 *
 * Each one is a raw CSS value rather than a number, so every control is a text
 * field and the defaults below are the stylesheet's, quoted rather than set:
 * passing them as args would write the variables out explicitly and hide the
 * fact that a variant can have a default of its own. `GlitchIcon` and
 * `GlitchImage` override `--glitch-split` in `glitch.css`, and that override is
 * visible only while the arg is empty.
 */
export const glitchArgTypes: Partial<ArgTypes<GlitchVars>> = {
  loop: {
    control: "text",
    description: "One full cycle. Four bursts are baked into it.",
    table: { defaultValue: { summary: "5.2s" }, category: "Timing" },
  },
  offset: {
    control: "text",
    description:
      "Shifts the burst schedule, so neighbours do not tear in unison.",
    table: { defaultValue: { summary: "0s" }, category: "Timing" },
  },
  amount: {
    control: "text",
    description: "Furthest a torn slice slides sideways.",
    table: { defaultValue: { summary: "6%" }, category: "Tearing" },
  },
  split: {
    control: "text",
    description:
      "Colour-channel separation. The text default is an em; the icon and image variants default to a percentage instead, since their boxes have no relationship to font-size.",
    table: {
      defaultValue: { summary: "0.018em / 0.7% / 0.5%" },
      category: "Tearing",
    },
  },
  channelA: {
    control: "color",
    description: "First channel colour.",
    table: { defaultValue: { summary: "#22e6ff" }, category: "Colour" },
  },
  channelB: {
    control: "color",
    description: "Second channel colour.",
    table: { defaultValue: { summary: "#ff3ddb" }, category: "Colour" },
  },
}
