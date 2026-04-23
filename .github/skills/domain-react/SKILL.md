---
name: domain-react
description: React + TypeScript-specific §4a gate overlays — enforces strict TS, component patterns, TanStack Router, accessibility, and Vitest. Use when any *.tsx, *.ts (frontend), or package.json with react present is being changed.
---
trig: *.tsx ∨ *.ts(frontend) ∨ package.json(react) detected · lang=react
in: changed-react-files · §4a-core-gates

Overlay on §4a core gates — apply WITH core, not instead of. ∀gate:0warn.

See [REFERENCE.md](REFERENCE.md) for the full gate overlay details.

## Quick Verify
`pnpm typecheck` → 0 errors · `pnpm lint` → 0 issues · `pnpm test` → ∀pass · `pnpm build` → 0 warnings
