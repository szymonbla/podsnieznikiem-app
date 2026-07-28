import { describe, expect, test } from "bun:test"
import { join } from "node:path"

const clientSourceRoot = join(import.meta.dirname, "..")

const sourceFiles = async (): Promise<ReadonlyArray<{ path: string; text: string }>> => {
  const glob = new Bun.Glob("**/*.{ts,tsx}")
  const files: Array<{ path: string; text: string }> = []

  for await (const relativePath of glob.scan({ cwd: clientSourceRoot })) {
    files.push({
      path: relativePath,
      text: await Bun.file(join(clientSourceRoot, relativePath)).text()
    })
  }

  return files
}

interface ModuleReference {
  readonly specifier: string
  readonly typeOnly: boolean
}

/**
 * Catches all four ways of pulling a module in: `import … from`,
 * `export … from`, `import "x"` for the side effect alone and `import("x")`.
 * Only the first two can be `type`-only; the rest always bring runtime.
 */
const moduleReferences = (text: string): ReadonlyArray<ModuleReference> => [
  ...[...text.matchAll(/\b(?:import|export)\s+(type\s+)?[^"';]*?\bfrom\s*["']([^"']+)["']/g)].map(
    (match) => ({ specifier: match[2] ?? "", typeOnly: match[1] !== undefined })
  ),
  ...[...text.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)].map((match) => ({
    specifier: match[1] ?? "",
    typeOnly: false
  })),
  ...[...text.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((match) => ({
    specifier: match[1] ?? "",
    typeOnly: false
  }))
]

/**
 * The client/server boundary is physical (DESIGN.md §3). Three things guard it
 * at once, because breaking the rule pulls the Effect runtime into the browser
 * bundle and the compiler will not report it: an ESLint rule on the sources,
 * this test, and a check of the built bundle (`scripts/check-bundle.ts`).
 *
 * The test stays despite the linter, because lint can be silenced with a
 * comment at the point of the violation — this test cannot.
 */
describe("client/server boundary", () => {
  test("the client imports nothing from the server application", async () => {
    const offenders = (await sourceFiles()).filter(({ text }) =>
      moduleReferences(text).some(
        ({ specifier }) =>
          specifier.includes("@podsnieznikiem/server") || specifier.includes("apps/server")
      )
    )

    expect(offenders.map(({ path }) => path)).toEqual([])
  })

  test("takes only types from the contracts package — the Effect runtime stays on the server", async () => {
    const offenders = (await sourceFiles()).filter(({ text }) =>
      moduleReferences(text).some(
        ({ specifier, typeOnly }) =>
          specifier.startsWith("@podsnieznikiem/contracts") && !typeOnly
      )
    )

    expect(offenders.map(({ path }) => path)).toEqual([])
  })

  test("does not reach for effect or any of its packages", async () => {
    const offenders = (await sourceFiles()).filter(({ text }) =>
      moduleReferences(text).some(
        ({ specifier }) => specifier === "effect" || specifier.startsWith("@effect/")
      )
    )

    expect(offenders.map(({ path }) => path)).toEqual([])
  })
})
