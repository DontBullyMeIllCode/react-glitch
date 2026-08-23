import type { ComponentPropsWithoutRef, ElementType, ReactNode, Ref } from "react";

import { useGlitch, type UseGlitchOptions } from "./useGlitch.js";
import { cn } from "./utils.js";
import "./glitch.css";

export type GlitchTextProps = Omit<UseGlitchOptions, "children"> & {
  /**
   * Plain strings are copied straight into the channel layers. Anything else —
   * a typewriter, split text, any component that rewrites itself — is mirrored
   * from the DOM instead, so the layers track it as it changes.
   */
  children: ReactNode;
  className?: string;
  /** Element to render as. Defaults to a span so it can sit inside a heading. */
  as?: ElementType;
};

/**
 * Text that tears like the sun does — see `glitch.css` for how the shader's
 * burst schedule is reproduced without any randomness.
 */
export function GlitchText({
  children,
  className,
  as = "span",
  channels = true,
  ...vars
}: GlitchTextProps) {
  const glitch = useGlitch({ children, channels, ...vars });

  // A bare ElementType collapses its props to `never`, so pin it to something
  // that accepts ordinary attributes plus the data-text the layers read from.
  const Tag = as as ElementType<
    ComponentPropsWithoutRef<"span"> & {
      "data-text"?: string;
      ref?: Ref<HTMLElement>;
    }
  >;

  return (
    <Tag
      {...glitch}
      className={cn(
        "glitch-text",
        !channels && "glitch-text--base-only",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
