import type { Decorator, Preview } from "@storybook/react-vite"

/*
 * The effect is built for a dark scene — the channels are a cyan and a magenta
 * that read as light leaking out of the tear. It still works on white, and the
 * image variant's screen blending behaves differently there, so the backdrop
 * is a toolbar toggle rather than a fixed choice.
 */
const SURFACES = {
  dark: { background: "#0a0c10", color: "#e8ecf1" },
  light: { background: "#f4f5f7", color: "#15181d" },
} as const

const withSurface: Decorator = (Story, context) => {
  const surface =
    SURFACES[context.globals.surface as keyof typeof SURFACES] ?? SURFACES.dark

  return (
    <div
      style={{
        ...surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "10rem",
        padding: "3rem 2rem",
        borderRadius: "0.5rem",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "1.5rem",
        letterSpacing: "0.04em",
        transition: "background 150ms ease, color 150ms ease",
      }}
    >
      <Story />
    </div>
  )
}

const preview: Preview = {
  decorators: [withSurface],
  parameters: {
    // Every knob is a string of CSS, so the descriptions earn their space.
    controls: { expanded: true },
    // The decorator paints the backdrop; the canvas one would only fight it.
    backgrounds: { disable: true },
    docs: { codePanel: true },
  },
  globalTypes: {
    surface: {
      description: "Backdrop the effect is shown against",
      toolbar: {
        title: "Surface",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { surface: "dark" },
}

export default preview
