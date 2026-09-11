/**
 * Renders the README previews from the real components.
 *
 * The effect is a step function — `steps(1, end)` over a fixed schedule, no
 * randomness and no JS loop — so the whole 5.2s loop has only as many distinct
 * states as it has keyframe offsets. Capturing exactly those, and giving each
 * GIF frame a delay equal to the gap until the next one, reproduces the
 * animation precisely from ~22 frames rather than ~130 sampled ones.
 *
 * The offsets are read out of `glitch.css`, so retiming the effect retimes the
 * previews. Usage: `npm run previews`.
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

// gifenc is CJS, so the named exports come off the default import.
import gifenc from "gifenc"
import { PNG } from "pngjs"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement as h } from "react"

import { GlitchIcon, GlitchImage, GlitchText } from "../dist/index.js"

const { GIFEncoder, applyPalette, quantize } = gifenc

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

const ROOT = new URL("..", import.meta.url).pathname
const OUT = join(ROOT, "previews")
const TMP = join(ROOT, "node_modules/.cache/previews")
const CSS = readFileSync(join(ROOT, "src/glitch.css"), "utf8")

/** One cycle, matching --glitch-loop in the stylesheet. */
const LOOP_MS = 5200
/** Rendered at 2x and displayed at half width, so the tear stays crisp. */
const SCALE = 2

/** Every offset any keyframe block names, in ascending order. */
function keyframeOffsets(css) {
  const times = new Set()

  for (const block of css.matchAll(/@keyframes\s+[\w-]+\s*\{([\s\S]*?)\n\}/g)) {
    for (const rule of block[1].matchAll(/(?:^|\n)\s*([\d.,%\s]+)\{/g)) {
      for (const part of rule[1].split(",")) {
        const value = Number.parseFloat(part)
        if (!Number.isNaN(value)) times.add(value)
      }
    }
  }

  return [...times].sort((a, b) => a - b)
}

const WARNING_ICON = h(
  "svg",
  {
    width: 64,
    height: 64,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  h("path", { d: "M12 3 2 20h20L12 3Z" }),
  h("path", { d: "M12 10v4" }),
  h("path", { d: "M12 17h.01" }),
)

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#160b2e"/><stop offset="0.55" stop-color="#4a1350"/><stop offset="1" stop-color="#0b0713"/>
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe66b"/><stop offset="0.5" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff2e6a"/>
    </linearGradient>
    <clipPath id="disc"><circle cx="240" cy="190" r="110"/></clipPath>
  </defs>
  <rect width="480" height="320" fill="url(#sky)"/>
  <g clip-path="url(#disc)">
    <rect x="130" y="80" width="220" height="220" fill="url(#sun)"/>
    <g fill="#0b0713" opacity="0.85">
      <rect x="130" y="196" width="220" height="6"/><rect x="130" y="212" width="220" height="9"/>
      <rect x="130" y="232" width="220" height="12"/><rect x="130" y="258" width="220" height="16"/>
    </g>
  </g>
  <rect x="0" y="236" width="480" height="84" fill="#0b0713"/>
  <rect x="0" y="234" width="480" height="2" fill="#ff2e6a" opacity="0.6"/>
</svg>`

const DEMOS = [
  {
    name: "glitch-text",
    width: 460,
    height: 110,
    node: h(GlitchText, { amount: "8%" }, "SIGNAL LOST"),
    style: "font-size: 2.6rem; font-weight: 600; letter-spacing: 0.06em;",
  },
  {
    name: "glitch-icon",
    width: 160,
    height: 120,
    node: h(GlitchIcon, null, WARNING_ICON),
    style: "",
  },
  {
    name: "glitch-image",
    width: 400,
    height: 280,
    node: h(GlitchImage, {
      src: `data:image/svg+xml,${encodeURIComponent(SCENE)}`,
      alt: "",
      width: 340,
      height: 227,
    }),
    style: "",
  },
]

function page(demo) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
${CSS}
html, body { margin: 0; padding: 0; }
body {
  width: ${demo.width}px; height: ${demo.height}px;
  display: flex; align-items: center; justify-content: center;
  background: #0a0c10; color: #e8ecf1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  ${demo.style}
}
</style></head><body>${renderToStaticMarkup(demo.node)}
<script>
  // Pin every animation to the requested instant, so the capture is a state
  // rather than a race with the clock.
  const t = Number(new URLSearchParams(location.search).get("t") ?? 0)
  for (const animation of document.getAnimations()) {
    animation.pause()
    animation.currentTime = t
  }
</script></body></html>`
}

function capture(htmlPath, timeMs, pngPath, demo) {
  execFileSync(
    CHROME,
    [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=" + SCALE,
      `--window-size=${demo.width},${demo.height}`,
      `--screenshot=${pngPath}`,
      "--virtual-time-budget=1500",
      `file://${htmlPath}?t=${timeMs}`,
    ],
    { stdio: "ignore" },
  )
}

/**
 * Consecutive states that render identically are held as one frame.
 *
 * The schedule brackets each burst with an idle keyframe a hair before it —
 * 5.9% against 6% — which is a real state change for the stylesheet but the
 * same pixels. Left alone those become 1cs frames, and GIF renderers widely
 * clamp anything under 2cs up to 10cs, which would stretch the loop.
 */
function merge(frames) {
  const merged = []

  for (const frame of frames) {
    const previous = merged.at(-1)

    if (previous && previous.png.data.equals(frame.png.data)) {
      previous.duration += frame.duration
    } else {
      merged.push({ ...frame })
    }
  }

  return merged
}

function encode(frames, outPath) {
  const gif = GIFEncoder()
  let target = 0
  let written = 0

  for (const { png, duration } of frames) {
    const { data, width, height } = png
    const palette = quantize(data, 256)
    const index = applyPalette(data, palette)

    /*
     * GIF stores delays in centiseconds, so each frame is rounded against the
     * elapsed total rather than on its own. The error stays under one tick
     * instead of accumulating across the loop.
     */
    target += duration
    const delay = Math.max(20, Math.round(target / 10) * 10 - written)
    written += delay

    gif.writeFrame(index, width, height, { palette, delay })
  }

  gif.finish()
  writeFileSync(outPath, Buffer.from(gif.bytes()))
}

const offsets = keyframeOffsets(CSS)
console.log(`${offsets.length} distinct states per loop`)

rmSync(TMP, { recursive: true, force: true })
mkdirSync(TMP, { recursive: true })
mkdirSync(OUT, { recursive: true })

for (const demo of DEMOS) {
  const htmlPath = join(TMP, `${demo.name}.html`)
  writeFileSync(htmlPath, page(demo))

  const frames = []

  for (const [i, offset] of offsets.entries()) {
    // The last offset closes the loop; it is the same state as the first.
    if (i === offsets.length - 1) break

    const timeMs = (offset / 100) * LOOP_MS
    const duration = ((offsets[i + 1] - offset) / 100) * LOOP_MS
    const pngPath = join(TMP, `${demo.name}-${String(i).padStart(2, "0")}.png`)

    capture(htmlPath, timeMs, pngPath, demo)
    frames.push({ png: PNG.sync.read(readFileSync(pngPath)), duration })
  }

  const outPath = join(OUT, `${demo.name}.gif`)
  const held = merge(frames)
  encode(held, outPath)
  console.log(
    `${demo.name}: ${frames.length} states held as ${held.length} frames -> previews/${demo.name}.gif`,
  )
}
