/**
 * The Effect runtime is meant to stay on the server (DESIGN.md §3). Lint
 * guards that at the source level, but the rule can be switched off with a
 * comment, and the dependency can creep in indirectly — through a package that
 * imports Effect itself. Hence a second, independent check that looks at what
 * actually came out of the bundler.
 */

import { readdir } from "node:fs/promises"
import { join } from "node:path"

const ASSETS = join(import.meta.dirname, "..", "apps", "client", "dist", "assets")

/**
 * Traces Effect leaves in bundled code. These names survive minification
 * because they are string literals — looking for identifiers is pointless.
 */
const EFFECT_MARKERS = ["effect/Effect", "@effect/platform", "EffectTypeId"]

const files = await readdir(ASSETS).catch(() => {
  console.error(`No ${ASSETS} directory — build the client first (bun run build:client).`)
  process.exit(1)
})

const offenders: Array<string> = []

for (const file of files) {
  if (!file.endsWith(".js")) continue

  const text = await Bun.file(join(ASSETS, file)).text()
  const found = EFFECT_MARKERS.filter((marker) => text.includes(marker))
  if (found.length > 0) offenders.push(`${file}: ${found.join(", ")}`)
}

if (offenders.length > 0) {
  console.error("The Effect runtime made it into the client bundle:")
  for (const offender of offenders) console.error(`  - ${offender}`)
  process.exit(1)
}

console.log("Client bundle is free of the Effect runtime.")
