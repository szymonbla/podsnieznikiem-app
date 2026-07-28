/**
 * Generates the client types from the server contract (DESIGN.md §5).
 *
 * Brings the server up on a free port, fetches the raw OpenAPI document from
 * it and runs that through `openapi-typescript`. The result is committed, and
 * CI repeats this command and runs `git diff --exit-code` — a stale file fails
 * the build.
 *
 * It deliberately goes through a **running server** rather than importing
 * `api.ts`: we generate exactly the document production serves.
 */
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"

import openapiTS, { astToString } from "openapi-typescript"

const repositoryRoot = join(import.meta.dirname, "..")
const outputPath = join(repositoryRoot, "apps/client/src/generated/api.d.ts")

const banner = `/**
 * GENERATED FILE — do not edit by hand.
 * Source: the server's OpenAPI document. Regenerate with \`bun run gen:api\`.
 */

`

const waitForOpenApi = async (baseUrl: string, deadlineMs: number): Promise<unknown> => {
  const deadline = Date.now() + deadlineMs

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/docs/openapi.json`)
      if (response.ok) return await response.json()
    } catch {
      // the server is not listening yet — keep trying until the deadline
    }
    await Bun.sleep(100)
  }

  throw new Error(`Server did not serve OpenAPI at ${baseUrl}/docs/openapi.json in time`)
}

/**
 * We take a free port from the system and release it immediately. A fixed
 * number would be a trap: if another process sat on it, the generator would
 * fetch **someone else's** contract and quietly write the wrong types.
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

  console.log(`Wrote ${outputPath}`)
} finally {
  server.kill()
  await server.exited
}
