/// <reference types="vite/client" />

/**
 * The server address baked in at build time. Without this declaration
 * `import.meta.env` yields `any`, and the project allows no `any`
 * (DESIGN.md §1).
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
