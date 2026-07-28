import js from "@eslint/js"
import tseslint from "typescript-eslint"

/**
 * Reguły struktury z `DESIGN.md` §3 pilnowane maszynowo, a nie dyscypliną.
 *
 * Wszystkie ograniczenia importów siedzą w jednej regule (`no-restricted-imports`),
 * więc ESLint nie scala ich, tylko nadpisuje ostatnim dopasowaniem. Dlatego
 * zestawy wzorców są tu składane jawnie dla każdej kombinacji: aplikacja
 * (klient/serwer) × miejsce (powłoka/warstwa modułu).
 */

/** Warstwy modułu idą w jedną stronę: domain ← configuration ← integration ← presentation. */
const LAYERS = ["domain", "configuration", "integration", "presentation"]

/**
 * Wejściem do modułu jest wyłącznie barrel — nie wolno sięgać w jego warstwy.
 * Dwa zapisy tego samego naruszenia: ścieżka z segmentem `modules` (tak pisze
 * powłoka) i wyjście dwa poziomy w górę do sąsiedniego modułu (tak wyglądałoby
 * to z wnętrza innego modułu).
 */
const barrelOnly = [
  {
    group: LAYERS.flatMap((layer) => [
      `**/modules/*/${layer}`,
      `**/modules/*/${layer}/**`,
      `../../*/${layer}`,
      `../../*/${layer}/*`,
      `../../*/${layer}/**`
    ]),
    message: "Moduł wystawia wyłącznie `index.ts` — importuj z barrela (DESIGN.md §3)."
  }
]

/** Wszystko, co leży wyżej w module — do tego dana warstwa nie ma prawa sięgać. */
const aboveLayer = (layer) => {
  const forbidden = LAYERS.slice(LAYERS.indexOf(layer) + 1)
  if (forbidden.length === 0) return []

  return [
    {
      group: forbidden.flatMap((higher) => [`**/${higher}/*`, `../${higher}/*`]),
      message: `Warstwa "${layer}" nie importuje z "${forbidden.join('", "')}" — zależności idą w jedną stronę (DESIGN.md §3).`
    }
  ]
}

/**
 * Granica klient/serwer jest fizyczna. Klient nie zna kodu serwera, a z paczki
 * kontraktów bierze wyłącznie typy — inaczej runtime Effecta ląduje
 * w przeglądarce. Od drugiej strony pilnuje tego weryfikacja bundla
 * (`scripts/check-bundle.ts`).
 */
const clientBoundary = [
  {
    group: ["**/apps/server/**", "@podsnieznikiem/server*"],
    message: "Klient nie importuje kodu serwera (DESIGN.md §3)."
  },
  {
    group: ["@podsnieznikiem/contracts", "@podsnieznikiem/contracts/*"],
    allowTypeImports: true,
    message:
      "Z paczki kontraktów wolno brać wyłącznie typy (`import type`) — inaczej runtime Effecta trafia do bundla (DESIGN.md §3)."
  },
  {
    group: ["effect", "effect/*", "@effect/*"],
    message: "Effect zostaje na serwerze (DESIGN.md §3)."
  }
]

const restrict = (patterns) => ({
  "no-restricted-imports": ["error", { patterns }]
})

/** Powłoka aplikacji — poza modułami, więc obowiązuje ją tylko reguła barrela. */
const shellConfigs = [
  {
    files: ["apps/client/src/**/*.{ts,tsx}"],
    ignores: ["apps/client/src/modules/**"],
    rules: restrict([...barrelOnly, ...clientBoundary])
  },
  {
    files: ["apps/server/src/**/*.ts"],
    ignores: ["apps/server/src/modules/**"],
    rules: restrict(barrelOnly)
  }
]

const layerConfigs = LAYERS.flatMap((layer) => [
  {
    files: [`apps/client/src/modules/*/${layer}/**/*.{ts,tsx}`],
    rules: restrict([...barrelOnly, ...aboveLayer(layer), ...clientBoundary])
  },
  {
    files: [`apps/server/src/modules/*/${layer}/**/*.ts`],
    rules: restrict([...barrelOnly, ...aboveLayer(layer)])
  }
])

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "apps/client/src/generated/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      // Ograniczenie przyjęte na wejściu: TypeScript bez `any` (DESIGN.md §1).
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },

  ...shellConfigs,
  ...layerConfigs,

  /* Testy wchodzą przez szwy, więc sięgają tam, gdzie kod produkcyjny nie może. */
  {
    files: ["**/__tests__/**", "**/*.test.{ts,tsx}", "scripts/**"],
    rules: { "no-restricted-imports": "off" }
  }
)
