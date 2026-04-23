---
name: workflow-migration
description: Safe database migration procedure — ADR, up/down scripts, idempotency verification, separate data vs schema commits. Use when a schema change or data transformation is needed.
---
trig: schema-∆·data-∆·db-migration-needed
in: schema-change-spec·data-transformation-spec

## Sequence
1. **ADR** — document why, options, decision
2. **up-script** — forward migration, idempotent
3. **down-script** — reverse migration, must fully undo up
4. **test** — up → verify-state → down → verify-original → up → verify-state
5. **commit** — 1mig=1commit · data-mig ≠ schema-mig (separate commits)
6. `dotnet ef migrations add {Name}` → review generated SQL before applying

## Gates
- reversible: up+down both work
- idempotent: running twice = running once
- data-mig ≠ schema-mig — ∅combine in one migration
- seed ∅ mig — seed data is separate
- ∅destructive ∅ ADR (dropping columns/tables requires justification)
- ∅EnsureCreated(prod) · EF migrations preferred

## Abort
- down-script fails → migration not ready
- data loss detected → halt · ADR required
- migration >30s on test data → split into smaller steps

