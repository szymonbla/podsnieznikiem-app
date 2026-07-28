/**
 * API identifier. Kept in its own file so modules can build their own handler
 * layers without importing `core/api.ts` — that would create a cycle.
 */
export const API_ID = "podsnieznikiem"
export type API_ID = typeof API_ID
