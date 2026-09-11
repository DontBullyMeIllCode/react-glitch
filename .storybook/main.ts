import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  // Stories sit beside the components they document, as the tests already do.
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    /*
     * The prop tables are the point of documenting a knob-heavy library, and
     * the default docgen drops props reached through a type import — which
     * here would be every `GlitchVars` knob. The filter keeps the table to
     * props this package declares, so the hundreds of inherited DOM
     * attributes stay out of it.
     */
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !prop.parent.fileName.includes("node_modules") : true,
    },
  },
}

export default config
