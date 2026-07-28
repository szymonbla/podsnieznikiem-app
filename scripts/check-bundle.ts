/**
 * Runtime Effecta ma zostać na serwerze (DESIGN.md §3). Lint pilnuje tego na
 * źródłach, ale reguła da się wyłączyć komentarzem, a zależność może wejść
 * pośrednio — przez paczkę, która sama importuje Effecta. Dlatego druga,
 * niezależna kontrola patrzy na to, co naprawdę wyszło z bundlera.
 */

import { readdir } from "node:fs/promises"
import { join } from "node:path"

const ASSETS = join(import.meta.dirname, "..", "apps", "client", "dist", "assets")

/**
 * Ślady, które Effect zostawia w zbundlowanym kodzie. Nazwy przetrwają
 * minifikację, bo są ciągami znaków — identyfikatorów szukać nie ma sensu.
 */
const EFFECT_MARKERS = ["effect/Effect", "@effect/platform", "EffectTypeId"]

const files = await readdir(ASSETS).catch(() => {
  console.error(`Brak katalogu ${ASSETS} — najpierw zbuduj klienta (bun run build:client).`)
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
  console.error("Runtime Effecta trafił do bundla klienta:")
  for (const offender of offenders) console.error(`  - ${offender}`)
  process.exit(1)
}

console.log("Bundle klienta bez runtime'u Effecta.")
