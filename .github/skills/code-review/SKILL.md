---
name: code-review
description: Executes all §4 review gates in strict order (Val→Cor→Tst→Sec→design→process→pre-merge), short-circuiting on phase-1 failure. Use when performing pre-commit review, pre-merge review, or any §5 review cycle.
---
trig: §5.pre-c·§5.pre-mrg·before-commit·before-merge·review-requested
in: changed-files·diff·git-log·§4-gates

See [REFERENCE.md](REFERENCE.md) for full phase-by-phase gate checklist.

## Phase Summary
1. **Val** — lint/format: 0warn, .editorconfig compliance, ∅suppress directives
2. **Cor** — build: 0warn, all existing tests pass
3. **Tst** — test suite: new behavior covered, cov:∆≥80%, test < impl in log
4. **Sec** — hostile review: ∅secrets, injection surfaces, auth, ∅CVE, antiforgery
5. **Cor.falsify** — 3 failure scenarios: null/empty/bounds/concurrency/error paths
6. **Typ** — ∅any/unsafe, pub-ret explicit, null@bound, DTO≠dom≠val
7. **Abs/Mnt/Perf** — DRY, SRP, ∅God-class, ∅N+1, async-all-the-way
8. **Doc/Git/GDPR/API/Dep** — process gates
9. **Pre-merge** — `git log #{N}`: seq? test<impl? 1c/unit? story?

## Verdict
- **P** → §6.tasklog · proceed
- **F** → revert → root-cause → log lesson → redo
- Same gate fails 3× → @agt:refactorer rewrite → ADR+skill

## Rules
- phase-1 short-circuits: ∅proceed to phase-2 on phase-1 fail
- min 2 cycles · max 5 → §5.stuck

