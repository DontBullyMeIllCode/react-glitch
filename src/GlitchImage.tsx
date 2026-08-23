import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "./utils.js";
import { type GlitchVars } from "./glitch-vars.js";
import { useGlitch } from "./useGlitch.js";
import "./glitch.css";

/** What GlitchImage takes for itself, on top of the image component's own props. */
type OwnProps<T extends ElementType> = GlitchVars & {
  /**
   * The image component to render. Anything that accepts a `className` fits —
   * a plain `"img"`, `next/image`, a CDN wrapper of your own. Its props are
   * checked and forwarded, so `<GlitchImage as={Image} fill />` stays typed.
   */
  as?: T;
  /** Class for the wrapper that carries the effect. */
  className?: string;
  /** Class for each copy of the image, since `className` is spoken for. */
  imageClassName?: string;
};

export type GlitchImageProps<T extends ElementType = "img"> = OwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof OwnProps<T>>;

/**
 * The glitch for bitmaps.
 *
 * Like `GlitchIcon` this clones its children into real channel layers, since an
 * image has no text for `attr(data-text)` to copy. Unlike the icon it cannot be
 * recoloured with `color` — see `glitch.css` for how each channel is multiplied
 * out of the bitmap instead.
 *
 * The image itself is whatever you pass as `as`, so the host framework keeps
 * its own loading, sizing and optimisation behaviour.
 */
export function GlitchImage<T extends ElementType = "img">({
  as,
  className,
  imageClassName,
  loop,
  amount,
  split,
  offset,
  channelA,
  channelB,
  ...image
}: GlitchImageProps<T>) {
  const { style } = useGlitch({
    loop,
    amount,
    split,
    offset,
    channelA,
    channelB,
  });

  // A bare ElementType collapses its props to `never`, so pin it to the props
  // of the element it stands in for. The caller's own props were already
  // checked against T on the way in.
  const Img = (as ?? "img") as ElementType<ComponentPropsWithoutRef<"img">>;
  const imgProps = image as unknown as ComponentPropsWithoutRef<"img">;
  const imgClass = cn("glitch-image__img", imageClassName);

  return (
    <span className={cn("glitch-image", className)} style={style}>
      <span className="glitch-image__base">
        <Img {...imgProps} className={imgClass} />
      </span>
      <span
        className="glitch-image__channel glitch-image__channel--a"
        aria-hidden
      >
        <Img {...imgProps} className={imgClass} />
      </span>
      <span
        className="glitch-image__channel glitch-image__channel--b"
        aria-hidden
      >
        <Img {...imgProps} className={imgClass} />
      </span>
    </span>
  );
}
