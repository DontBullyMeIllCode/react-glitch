import { describe, expect, it } from "vitest"

// ?raw rather than the plain import: the stylesheet is the subject here, and
// vitest stubs CSS imports out by default.
import css from "./glitch.css?raw"

/** Every variant's root class, and the layers underneath it that animate. */
const VARIANTS = [
  { root: ".glitch-text", layers: [".glitch-text"] },
  { root: ".glitch-icon", layers: [".glitch-icon__base", ".glitch-icon__channel"] },
  { root: ".glitch-image", layers: [".glitch-image__base", ".glitch-image__channel"] },
]

/**
 * The variables a layer cannot animate without. An undefined custom property is
 * invalid at computed-value time, which takes the whole `animation` shorthand
 * down with it — silently, and only in a browser, which is why this is checked
 * against the stylesheet rather than the rendered markup.
 */
const REQUIRED = [
  "--glitch-loop",
  "--glitch-amount",
  "--glitch-split",
  "--glitch-offset",
  "--glitch-a",
  "--glitch-b",
]

type Rule = { selectors: string[]; body: string }

/** Flat rules only — enough here, since no variable is set inside an at-rule. */
function rules(source: string): Rule[] {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, "")
  const found: Rule[] = []

  for (const match of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1]?.trim()
    if (!selector || selector.startsWith("@") || selector.startsWith("%")) continue
    found.push({
      selectors: selector.split(",").map((s) => s.trim()),
      body: match[2] ?? "",
    })
  }

  return found
}

const parsed = rules(css)

/** What a variant root ends up carrying, across every rule that targets it. */
function propertiesOn(root: string): string[] {
  return parsed
    .filter((rule) => rule.selectors.includes(root))
    .flatMap((rule) => [...rule.body.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]!))
}

describe("glitch.css", () => {
  it.each(VARIANTS)("defines every variable on $root", ({ root }) => {
    expect(propertiesOn(root)).toEqual(expect.arrayContaining(REQUIRED))
  })

  it.each(VARIANTS.flatMap(({ root, layers }) => layers.map((layer) => ({ root, layer }))))(
    "$layer only reads variables its root ($root) defines",
    ({ root, layer }) => {
      const used = parsed
        .filter((rule) => rule.selectors.some((s) => s.startsWith(layer)))
        .flatMap((rule) => [...rule.body.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]!))

      expect(propertiesOn(root)).toEqual(expect.arrayContaining([...new Set(used)]))
    },
  )

  it("lets each variant override the split its own box needs", () => {
    // The shared block is an em; a box with no relationship to font-size is not.
    const splitFor = (root: string) =>
      parsed
        .filter((rule) => rule.selectors.length === 1 && rule.selectors[0] === root)
        .flatMap((rule) => [...rule.body.matchAll(/--glitch-split\s*:\s*([^;]+)/g)])
        .map((m) => m[1]!.trim())

    expect(splitFor(".glitch-icon")).toEqual(["0.7%"])
    expect(splitFor(".glitch-image")).toEqual(["0.5%"])
  })
})
