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
 * Łapie wszystkie cztery sposoby wciągnięcia modułu: `import … from`,
 * `export … from`, `import "x"` dla samego efektu ubocznego i `import("x")`.
 * Tylko pierwsze dwa mogą być `type`-only; pozostałe zawsze wnoszą runtime.
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
 * Granica klient/serwer jest fizyczna (DESIGN.md §3). Pilnują jej trzy rzeczy
 * naraz, bo złamanie reguły wciąga runtime Effecta do bundla przeglądarki,
 * a kompilator tego nie zgłosi: reguła ESLinta na źródłach, ten test i kontrola
 * zbudowanego bundla (`scripts/check-bundle.ts`).
 *
 * Test zostaje mimo lintera, bo lint da się wyciszyć komentarzem w miejscu
 * złamania reguły — a tego testu nie.
 */
describe("granica klient/serwer", () => {
  test("klient nie importuje niczego z aplikacji serwera", async () => {
    const offenders = (await sourceFiles()).filter(({ text }) =>
      moduleReferences(text).some(
        ({ specifier }) =>
          specifier.includes("@podsnieznikiem/server") || specifier.includes("apps/server")
      )
    )

    expect(offenders.map(({ path }) => path)).toEqual([])
  })

  test("z paczki kontraktów bierze wyłącznie typy — runtime Effecta zostaje na serwerze", async () => {
    const offenders = (await sourceFiles()).filter(({ text }) =>
      moduleReferences(text).some(
        ({ specifier, typeOnly }) =>
          specifier.startsWith("@podsnieznikiem/contracts") && !typeOnly
      )
    )

    expect(offenders.map(({ path }) => path)).toEqual([])
  })

  test("nie sięga po effect ani po żadną jego paczkę", async () => {
    const offenders = (await sourceFiles()).filter(({ text }) =>
      moduleReferences(text).some(
        ({ specifier }) => specifier === "effect" || specifier.startsWith("@effect/")
      )
    )

    expect(offenders.map(({ path }) => path)).toEqual([])
  })
})
