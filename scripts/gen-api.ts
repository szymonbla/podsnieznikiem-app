/**
 * Generator typów klienta z kontraktu serwera (DESIGN.md §5).
 *
 * Podnosi serwer na wolnym porcie, pobiera z niego surowy dokument OpenAPI
 * i przepuszcza przez `openapi-typescript`. Wynik jest commitowany, a CI
 * powtarza tę komendę i robi `git diff --exit-code` — nieaktualny plik
 * wywala build.
 *
 * Świadomie idzie przez **działający serwer**, a nie przez import `api.ts`:
 * generujemy dokładnie ten dokument, który wystawia produkcja.
 */
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

import openapiTS, { astToString } from "openapi-typescript"

const repositoryRoot = join(import.meta.dirname, "..")
const outputPath = join(repositoryRoot, "apps/client/src/generated/api.d.ts")

const banner = `/**
 * PLIK GENEROWANY — nie edytować ręcznie.
 * Źródło: dokument OpenAPI serwera. Regeneracja: \`bun run gen:api\`.
 */

`

const waitForOpenApi = async (baseUrl: string, deadlineMs: number): Promise<unknown> => {
  const deadline = Date.now() + deadlineMs

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/docs/openapi.json`)
      if (response.ok) return await response.json()
    } catch {
      // serwer jeszcze nie słucha — próbujemy dalej, aż do terminu
    }
    await Bun.sleep(100)
  }

  throw new Error(`Serwer nie wystawił OpenAPI pod ${baseUrl}/docs/openapi.json w wyznaczonym czasie`)
}

/**
 * Wolny port bierzemy od systemu i natychmiast zwalniamy. Stały numer byłby
 * pułapką: gdyby siedział na nim inny proces, generator pobrałby **cudzy**
 * kontrakt i po cichu zapisał złe typy.
 */
const freePort = (): number => {
  const probe = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data: () => {} } })
  const { port } = probe
  probe.stop(true)
  return port
}

const port = freePort()
const server = Bun.spawn(["bun", "run", "apps/server/src/core/server.ts"], {
  cwd: repositoryRoot,
  env: { ...process.env, PORT: String(port) },
  stdout: "ignore",
  stderr: "inherit"
})

try {
  const document = await waitForOpenApi(`http://localhost:${port}`, 30_000)
  const ast = await openapiTS(document as Parameters<typeof openapiTS>[0])

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, banner + astToString(ast), "utf8")

  console.log(`Zapisano ${outputPath}`)
} finally {
  server.kill()
  await server.exited
}
