/**
 * Identyfikator API. Osobny plik, żeby moduły mogły budować własne warstwy
 * handlerów bez importowania `core/api.ts` — inaczej powstałby cykl.
 */
export const API_ID = "podsnieznikiem"
export type API_ID = typeof API_ID
