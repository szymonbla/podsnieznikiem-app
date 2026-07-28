/**
 * Numer żyje w bazie jako dziewięć gołych cyfr (DESIGN.md §6). Czytelny format
 * i prefiks kierunkowy powstają dopiero tutaj, po drodze na ekran — żeby
 * istniała jedna reprezentacja do porównywania i jedna do pokazywania.
 */

const PHONE_DIGITS = 9

/** Prefiks kierunkowy w trzech zapisach, jakie ludzie faktycznie wklejają. */
const DIALING_PREFIX = /^(?:\+48|0048|48)/

/** Jedno miejsce, w którym „cokolwiek wpisano" staje się samymi cyframi. */
const digitsOf = (input: string): string => input.replace(/\D/g, "")

/**
 * Zostawia same cyfry i ścina prefiks kierunkowy — po to, żeby `"+48 602-118-447"`,
 * `"602 118 447"` i `"602118447"` sprowadzały się do jednego ciągu.
 *
 * Kierunkowy ścinany jest tylko wtedy, gdy naprawdę nim jest: gdy zapis zaczyna
 * się od `+` albo `00`, albo gdy cyfr jest więcej, niż mieści numer. Samo `48`
 * wpisane w wyszukiwarkę to fragment numeru, nie prefiks — i takim zostaje.
 */
export const normalizePhone = (input: string): string => {
  const digits = digitsOf(input)
  const explicitPrefix = /^\s*(?:\+|00)/.test(input)
  if (!explicitPrefix && digits.length <= PHONE_DIGITS) return digits

  const withoutPrefix = digits.replace(DIALING_PREFIX, "")

  return withoutPrefix.length > 0 ? withoutPrefix : digits
}

/**
 * `602118447` → `602 118 447`. Numer o nietypowej długości wraca bez zmian —
 * lepiej pokazać go surowo niż pociąć w miejscach, które niczego nie znaczą.
 */
export const formatPhone = (phone: string): string => {
  const digits = digitsOf(phone)
  if (digits.length !== PHONE_DIGITS) return phone

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

/** Adres do wybrania numeru — z kierunkowym, bo `tel:` nie zna kontekstu kraju. */
export const phoneHref = (phone: string): string => `tel:+48${digitsOf(phone)}`
