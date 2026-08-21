/*
 * The client is served by Cloudflare Pages and the server runs in AWS, so every
 * browser request is cross-origin and the browser asks permission first. A wrong
 * `ALLOWED_ORIGINS` fails in one direction only: `curl` keeps working while the
 * app goes blank. That is why this is a test and not a manual check.
 *
 * The variable is set here, before any layer is built, because the layer reads
 * it once at start-up (`core/layers.ts`).
 */
process.env["ALLOWED_ORIGINS"] = "https://app.podsnieznikiem.pl"

const { describe, expect, test } = await import("bun:test")
const { Effect } = await import("effect")
const { withServer } = await import("../../__tests__/harness.js")

const ALLOWED = "https://app.podsnieznikiem.pl"

describe("cross-origin permission", () => {
  test("the named origin is allowed", () =>
    withServer(({ baseUrl }) =>
      Effect.promise(async () => {
        const response = await fetch(`${baseUrl}/contacts`, {
          headers: { Origin: ALLOWED }
        })

        expect(response.status).toBe(200)
        expect(response.headers.get("access-control-allow-origin")).toBe(ALLOWED)
      })
    ))

  test("an origin that is not named gets no permission", () =>
    withServer(({ baseUrl }) =>
      Effect.promise(async () => {
        const response = await fetch(`${baseUrl}/contacts`, {
          headers: { Origin: "https://obcy.example" }
        })

        /* The server answers; the browser is the one that refuses to hand the
         * answer to the page. The absence of the header is the refusal. */
        expect(response.headers.get("access-control-allow-origin")).toBeNull()
      })
    ))

  /*
   * This one guards a mistake already made once. Handed an empty list, the
   * middleware answers `Access-Control-Allow-Origin: *` — a deployment that
   * forgot the variable would be readable by every site on the internet.
   */
  test("naming no origin allows no origin, rather than allowing all", () => {
    process.env["ALLOWED_ORIGINS"] = ""
    return withServer(({ baseUrl }) =>
      Effect.promise(async () => {
        const response = await fetch(`${baseUrl}/contacts`, {
          headers: { Origin: ALLOWED }
        })

        expect(response.headers.get("access-control-allow-origin")).toBeNull()
      })
    ).finally(() => {
      process.env["ALLOWED_ORIGINS"] = ALLOWED
    })
  })

  test("the browser's preliminary question is answered", () =>
    withServer(({ baseUrl }) =>
      Effect.promise(async () => {
        const response = await fetch(`${baseUrl}/contacts`, {
          method: "OPTIONS",
          headers: {
            Origin: ALLOWED,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
          }
        })

        expect(response.headers.get("access-control-allow-origin")).toBe(ALLOWED)
        expect(response.headers.get("access-control-allow-methods")).toContain("POST")
      })
    ))
})
