# react-glitch

CSS-driven glitch effects for React. Text tears on a fixed burst schedule — no
randomness, no animation loop in JavaScript, no runtime cost beyond the styles.

<img src="https://raw.githubusercontent.com/DontBullyMeIllCode/react-glitch/main/previews/glitch-text.gif" width="460" alt="The words SIGNAL LOST tearing into cyan and magenta slices, four times over five seconds">

**[Turn the knobs in Storybook →](https://dontbullymeillcode.github.io/react-glitch/)**

## Install

```sh
npm install @dontbullymeillcode/react-glitch
```

React 18 or newer is required as a peer dependency.

## Usage

Import the stylesheet once, near your app entry:

```ts
import '@dontbullymeillcode/react-glitch/styles.css'
```

Then:

```tsx
import { GlitchText, GlitchIcon } from '@dontbullymeillcode/react-glitch'
import { TriangleAlert } from 'lucide-react'

export function Title() {
  return (
    <h1>
      <GlitchIcon><TriangleAlert /></GlitchIcon>
      <GlitchText amount="8%">SIGNAL LOST</GlitchText>
    </h1>
  )
}
```

Both variants share the same knobs and the same burst schedule. Give them
different `offset` values so they do not tear in unison.

Plain strings are copied straight into the channel layers. Anything else — a
typewriter, split text, any component that rewrites itself — is mirrored from
the DOM instead, so the layers track it as it changes:

```tsx
<GlitchText>
  <Typewriter text="SIGNAL LOST" />
</GlitchText>
```

## API

### `<GlitchText>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Text to tear. Strings are copied; anything else is mirrored. |
| `as` | `ElementType` | `"span"` | Element to render, so it can sit inside a heading. |
| `className` | `string` | — | Merged with the variant class via `tailwind-merge`. |
| `channels` | `boolean` | `true` | Set `false` for base jitter and dropout only, with no colour split. |
| `loop` | `string` | `"5.2s"` | One full cycle. Four bursts are baked into it. |
| `amount` | `string` | `"6%"` | Furthest a torn slice slides sideways. |
| `split` | `string` | `"0.018em"` | Colour-channel separation. |
| `offset` | `string` | `"0s"` | Shifts the burst schedule, so neighbours do not tear in unison. |
| `channelA` | `string` | `"#22e6ff"` | First channel colour. |
| `channelB` | `string` | `"#ff3ddb"` | Second channel colour. |

### `<GlitchIcon>`

The glitch for things that are not text. `GlitchText` builds its colour
channels from `attr(data-text)`, which an SVG cannot supply — so an icon would
only ever get the base jitter. `GlitchIcon` clones its children into real
channel layers instead, which is safe precisely because the content is static:

```tsx
<GlitchIcon className="size-6" split="1.2%"><TriangleAlert /></GlitchIcon>
```

<img src="https://raw.githubusercontent.com/DontBullyMeIllCode/react-glitch/main/previews/glitch-icon.gif" width="160" alt="A warning triangle icon tearing into cyan and magenta slices">

Takes `children`, `className`, and every knob from the table above except
`channels`. The duplicated layers are `aria-hidden`, so the content is
announced once.

Anything stateful or animated belongs in `GlitchText`, which mirrors rather
than duplicates — cloning it would run it, and its callbacks, three times over.
`--glitch-split` defaults to `0.7%` here rather than the text variant's `em`,
since an icon's box has no meaningful relationship to font-size.

### `<GlitchImage>`

The glitch for bitmaps. Like `GlitchIcon` it clones into real channel layers,
but an image cannot be recoloured with `color` the way a `currentColor` icon
can — so each channel multiplies its colour out of its own copy of the bitmap,
and the copies are screened back over the base.

The image component is yours to choose, so the host framework keeps its own
loading, sizing and optimisation behaviour:

```tsx
import Image from 'next/image'

<GlitchImage as={Image} src="/wreck.png" alt="a wreck" width={640} height={480} />
<GlitchImage src="/wreck.png" alt="a wreck" />            {/* plain img */}
```

`as` defaults to `"img"`. Whatever you pass has its own props type-checked and
forwarded to every layer, so a missing `width` on `next/image` is still a
compile error.

<img src="https://raw.githubusercontent.com/DontBullyMeIllCode/react-glitch/main/previews/glitch-image.gif" width="400" alt="A sunset image tearing into colour-separated slices">

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `ElementType` | `"img"` | The image component to render. |
| `className` | `string` | — | Class for the wrapper that carries the effect. |
| `imageClassName` | `string` | — | Class for each copy of the image, since `className` is spoken for. |

Plus every knob from the table above except `channels`. `--glitch-split`
defaults to `0.5%` here, a percentage rather than an `em` for the same reason
the icon uses one.

The duplicated layers are `aria-hidden`, so the image is announced once. Bear
in mind the component renders three copies — fine for a cached static asset,
but it is not the place for anything with a side effect on render.

### `useGlitch(options?)`

The wiring behind `<GlitchText>`, for building your own glitched element. Takes
the same knobs plus `children` and `channels`, and returns props to spread:

```tsx
import { useGlitch } from '@dontbullymeillcode/react-glitch'

function GlitchBadge({ children }: { children: React.ReactNode }) {
  const glitch = useGlitch({ children, amount: '3%' })
  return <span {...glitch} className="glitch-text">{children}</span>
}
```

It returns `ref` (attach it so live children can be mirrored), `style` (the
custom properties the stylesheet reads), and `data-text` (copy for the channel
layers, `undefined` while it is mirrored). The variant class stays with the
component, so each variant can style its own layers.

A variant that carries its own copies — as `GlitchIcon` and `GlitchImage` do —
can take `style` alone and leave the ref unattached, which keeps the mirroring
inert.

### `glitchStyle(vars)`

Maps the knobs onto their CSS custom properties. Exported as an escape hatch for
styling elements the hook does not own.

## Reduced motion

`glitch.css` disables the animation under `prefers-reduced-motion: reduce`.

## Development

```sh
npm install
npm test          # vitest
npm run typecheck # tsc --noEmit
npm run lint      # eslint
npm run build     # tsup -> dist/ (ESM + CJS + types + CSS)
```

### Storybook

Every knob in the tables above is a live control, and the three variants are
easiest to tell apart side by side:

```sh
npm run storybook       # dev server on :6006
npm run build-storybook # static build -> storybook-static/
```

Stories sit beside the components as `src/*.stories.tsx`, so `npm run
typecheck` and `npm run lint` cover them; `src/index.ts` never reaches them, so
they stay out of `dist`. Pushing to `main` publishes them to [GitHub Pages](https://dontbullymeillcode.github.io/react-glitch/).

Note that the effect is disabled under `prefers-reduced-motion: reduce` — if a
story looks static, check that setting before the build.

### Previews

```sh
npm run previews  # previews/*.gif, from the built components
```

The README's GIFs are generated rather than recorded. Because the effect is a
step function over a fixed schedule, the whole loop has only as many distinct
states as `glitch.css` has keyframe offsets — the script reads those offsets
out of the stylesheet, pins each animation to that exact instant in headless
Chrome, and gives every GIF frame a delay equal to the gap until the next one.
Twenty-two states become fifteen held frames and an exactly 5200ms loop, so
retiming the effect retimes the previews.

Needs Chrome; set `CHROME_PATH` if it is not in the default macOS location.
`previews/` is outside the `files` list, so none of it reaches the tarball.

## License

MIT © Alexandra Smith
