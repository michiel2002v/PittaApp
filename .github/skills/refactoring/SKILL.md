---
name: refactoring
description: Disciplined structural improvement under behavioral equivalence — characterize, small steps, verify. Use when addressing tech debt, extracting code, or restructuring without adding new behavior.
---
trig: tech-debt·extraction-needed·restructuring·smell-detected·∅new-behavior
in: target-code·smell-description·desired-structure

**Precondition**: ∅refactor without tests. Coverage < 80% → write characterization tests first.

## Steps
1. **identify** — name the smell, scope the files/LOC. >10 files → split.
2. **characterize** — run tests (all pass = baseline). Write characterization tests if coverage < 80%.
3. **plan** — target structure, refactoring patterns, ADR if architectural boundary changes.
4. **execute** — one transformation at a time. Run tests after each. ∅bundle. Commit at each stable green point.
5. **verify** — ∀original + characterization tests pass. §4 Abs/Mnt/Kode gates. ∅perf regression.
6. **cleanup** — remove redundant scaffolding, update docs if public API changed.

See [REFERENCE.md](REFERENCE.md) for detailed step guidance.

## Rules
- ∅behavior changes · ∅refactor without tests · small steps each green
- each commit = one transformation = tests green
- DRY is mandatory — duplication found must be resolved

## Fail
- tests fail after transformation → revert → re-examine assumption
- refactoring reveals bug → STOP → hand to debugger → resume
- scope grows beyond plan → stop → re-plan → split

