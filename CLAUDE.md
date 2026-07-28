# Pod Śnieżnikiem

Platforma do obsługi jednego domku na wynajem. Słownik domenowy: `CONTEXT.md`.
Architektura: `docs/DESIGN.md`. Decyzje: `docs/adr/`. Specyfikacje: `docs/specs/`.

Package manager, runtime i test runner: **bun**. Nigdy npm/pnpm/yarn.

## Agent skills

### Issue tracker

Lokalny markdown — issues w `.scratch/<feature>/issues/`, specyfikacje w `docs/specs/`.
Zob. `docs/agents/issue-tracker.md`.

### Triage labels

Domyślne pięć ról: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`. Zob. `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` w korzeniu repo. Zob. `docs/agents/domain.md`.
