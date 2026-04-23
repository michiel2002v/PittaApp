---
name: task-triage
description: Classifies a task into a type (trivial/standard/complex/docs/config/deps/ci/bootstrap/merge/review-ext) and selects the correct dispatch path. Use before any planning or implementation — always the first step of §2.
---
trig: §2.pre-code·new-task-received·before-plan
in: task-description·context·scope-estimate

## Classes & Dispatch

| Class | When | Dispatch |
|-------|------|---------|
| trivial | single-file, no logic, no tests | implementer→1×reviewer · ∅planner · ∅critic · ∅TDD |
| standard | <10 files, clear scope, tests needed | full-workflow |
| complex | >10 files \| arch change \| unclear scope | full-workflow + ADR if unsplit |
| docs | documentation-only | workflow-docs |
| config | config/metadata-only | workflow-config |
| deps | dependency updates | dependency-audit→implementer→reviewer |
| ci | CI/CD pipeline | @agt:infra-ops |
| bootstrap | greenfield project | workflow-bootstrap |
| merge | branch merge/conflict | workflow-merge |
| review-ext | external PR review | workflow-external-review |

## Scope Estimate
- est(files/LOC) · >10 files → split∨justify · >50LOC/file → review-first
- complex + >10 files → critic.failure-mode-1: scope + ADR-if-unsplit

## Rules
- classify before any work — ∅assume · evidence-based
- reclassify if scope changes · ∅code before triage + plan (§2: ∅code-before-plan)

## Fail
- ambiguous → assume standard · scope expands → reclassify → replan

