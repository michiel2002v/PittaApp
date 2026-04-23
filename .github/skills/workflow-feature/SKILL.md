---
name: workflow-feature
description: End-to-end feature delivery — Analysis Gate check, feature file, plan, branch, TDD cycles, architecture/ADR update, review, docs commit, pre-merge, PR. Use when starting a new feature task or when #{N} is assigned.
---
trig: new-feature·new-task·#{N}-assigned
in: requirement·#{N}·branch-scope

## Sequence

### 0. Analysis Gate — MUST PASS before any planning or code
1. Check `docs/features/` for a file matching this feature (`xxx-FeatureName.md`).
   - **Missing?** → STOP. Prompt: "⛔ No feature file found. Copy `docs/features/FEATURE_TEMPLATE.md`, name it `NNN-FeatureName.md` (next sequence number), and fill in §1–5 before continuing."
   - **Exists but §3 empty?** → WARN. Remind author: §3 (Security Impact) must be complete before Design Gate.
   - **Exists but §5 empty?** → STOP. Dev work cannot begin without environment separation plan. Prompt author to fill §5.
2. Check `SECURITY.md §1.2` for risks referenced in feature file §4.2. Warn if not present.
3. Check `SECURITY.md §1.1` for assets referenced in feature file §4.1. Warn if not present.
4. Read `docs/architecture/ARCHITECTURE.md` and `docs/architecture/adr/` before proceeding.
5. Analysis Gate: **✅ pass** → continue to §1. **⛔ fail** → halt and surface blockers to user.

### 1. Plan (§2.plan)
- Scan tasks/lessons.md → write tasks/todo.md → evaluate candidates → choose + justify
- Identify `[ARCH]` items: which ARCHITECTURE.md sections need updating, which ADRs to create
- Identify `[SSDLC]` items: risk/asset register deltas, env separation confirmation
- Commit plan: `docs(plan): #{N} feature planning`

### 2. Branch (§3.branch)
- Create branch `#{N}-slug` from `main`

### 3. Design Gate — before first implementation commit
- Update `docs/architecture/ARCHITECTURE.md`:
  - Add new components to Components table
  - Add new data flows (or update DATA_FLOWS.md reference)
  - Update Risk Mitigations table with new/updated mitigations
  - Update Security Design Checklist items for this feature
- Create ADR(s) for every significant design decision (see criteria in `AGENTS.md`):
  - File: `docs/architecture/adr/ADR-XXX-short-title.md` (from `ADR_TEMPLATE.md`)
  - Assign next sequential ADR number
  - Reference ADR in feature file §4.3 and in ARCHITECTURE.md Risk Mitigations table
- Update `SECURITY.md §1.5` (Threat Model) for new data flows / trust boundaries
- Feature file §7 Gate 2 checklist items completed
- Design reviewed by Security Champion or peer
- Commit: `docs(design): #{N} architecture + ADR updates`

### 4. TDD Cycles — red→green→refactor (repeat per behavior)
- Each cycle: test commit → feat commit → refactor commit
- Before each commit: @agt:security-reviewer checks for gate violations
- Apply all OWASP Top 10 mitigations marked in feature file §3.3
- Apply all ASVS Level 2 controls marked in feature file §3.4
- Env separation enforced: no dev/prod config bleed

### 5. Review (§5.review)
- min 2 TDD cycles · run ∥(@agt:reviewer + @agt:security-reviewer)
- security-reviewer verifies:
  - Feature file §3 Security Impact is reflected in code
  - Feature file §5 Environment Separation is respected
  - `ARCHITECTURE.md` is consistent with implementation
  - All ADRs referenced are in `docs/architecture/adr/`
- §4∀pass required

### 6. Docs Commit (final)
- Update feature file §7 gate checklists (Gates 3 + 4 items complete)
- Confirm `SECURITY.md` §1.2 is current and consistent with feature files
- Commit: `docs(feature): #{N} feature file + SSDLC gate update`

### 7. Pre-merge Check (§5.pre-mrg)
- `git log #{N}`: verify commit sequence (plan → design → impl cycles → docs)
- Feature file §7 Gate 3 + 4 all checked
- All security-reviewer findings resolved

### 8. PR Creation
- PR body references: feature file path, ADR(s) created, ARCHITECTURE.md sections updated
- Label: T · size:{s-count}c
- Merge

## Gates
- §0 Analysis Gate MUST pass before §1 (no feature file = no plan)
- Design Gate MUST pass before §4 (no architecture update = no code)
- §4∀pass at each commit · test-commit < impl-commit · ∀commit = 1 unit · §5.P before merge

## Abort
- §5.stuck@5cyc → handoff · revert.depth>2 → abandon+ADR · scope-creep → halt → replan
- Analysis Gate FAIL → halt, surface blockers to user, do not proceed
