import { SQL } from "bun"

/**
 * Seam 1 tests run against a real Postgres, and the harness empties the
 * `contacts` table before every test (`harness.ts`). Pointed at the working
 * database that would wipe the sample data on each `bun run test` — so the
 * suite gets a database of its own here, before any test module is loaded.
 *
 * The name is derived from `DATABASE_URL` rather than configured separately:
 * one address to set up, and the test database cannot drift onto a different
 * host than the one being developed against.
 */
const url = process.env["DATABASE_URL"]
if (url === undefined || url === "") {
  throw new Error("DATABASE_URL is required to run the tests — see .env.example")
}

const testUrl = new URL(url)
const name = testUrl.pathname.replace(/^\//, "")
const testName = name.endsWith("_test") ? name : `${name}_test`
testUrl.pathname = `/${testName}`

/*
 * `create database` cannot run inside the database it creates, so the check
 * goes through `postgres` — the maintenance database every cluster has.
 */
const adminUrl = new URL(testUrl)
adminUrl.pathname = "/postgres"

const admin = new SQL(adminUrl.toString())
try {
  const existing = await admin`select 1 from pg_database where datname = ${testName}`
  if (existing.length === 0) {
    /* The name comes from our own configuration, not from a request — but it still goes through an identifier quote. */
    await admin.unsafe(`create database "${testName.replace(/"/g, '""')}"`)
  }
} finally {
  await admin.close()
}

/*
 * The layers read the address from the environment (`core/config.ts`), so
 * redirecting it here is enough — no test knows it is running on a copy. The
 * schema is created by the migrations that run on every server start-up.
 */
process.env["DATABASE_URL"] = testUrl.toString()
