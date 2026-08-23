import type { ReactNode } from "react";

import { cn } from "./utils.js";
import { type GlitchVars } from "./glitch-vars.js";
import { useGlitch } from "./useGlitch.js";
import "./glitch.css";

export type GlitchIconProps = GlitchVars & {
  /**
   * Static markup — a lucide icon, an image, a badge. It is rendered three
   * times, so anything stateful or animated belongs in `GlitchText` instead,
   * which mirrors rather than duplicates.
   */
  children: ReactNode;
  className?: string;
};

/**
 * The glitch for things that are not text.
 *
 * `GlitchText` builds its colour channels from `attr(data-text)`, which an SVG
 * cannot supply — an icon has no text to copy, so it only ever gets the base
 * jitter. Here the children are cloned into the channel layers instead, which
 * is safe precisely because the content is static.
 */
export function GlitchIcon({ children, className, ...vars }: GlitchIconProps) {
  /*
   * Only the custom properties are wanted here. The hook's other job — keeping
   * data-text in step with live children — belongs to the variants that read
   * attr(data-text); leaving its ref unattached is what keeps that effect
   * inert, since the layers below carry the copy instead.
   */
  const { style } = useGlitch(vars);

  return (
    <span className={cn("glitch-icon", className)} style={style}>
      <span className="glitch-icon__base">{children}</span>
      <span
        className="glitch-icon__channel glitch-icon__channel--a"
        aria-hidden
      >
        {children}
      </span>
      <span
        className="glitch-icon__channel glitch-icon__channel--b"
        aria-hidden
      >
        {children}
      </span>
    </span>
  );
}
