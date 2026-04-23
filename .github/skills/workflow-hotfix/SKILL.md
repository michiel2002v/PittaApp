---
name: workflow-hotfix
description: Production bugfix flow — branch from main, TDD red/green fix, review, merge, cherry-pick, rollback plan. Use when a P0/P1 production bug needs an immediate fix.
---
trig: prod-bug·P0/P1·hotfix-needed
in: incident-report·reproduction-steps

## Sequence
1. §3.hotfix-branch — `#{N}-hotfix-slug` from main
2. reproduce — confirm bug exists · capture evidence
3. tdd-workflow — test-for-bug (red) → fix (green) → verify
4. §5.review — min 1 cycle · §4.Cor+Sec+Tst gates
5. merge → main
6. cherry-pick → release branch
7. document rollback-plan

## Gates
- fix-only — ∅new features · ∅refactoring
- §4.Cor+Sec+Tst ∀pass · rollback-plan before merge · ∅scope-creep

## Abort
- fix introduces new failures → revert → escalate
- root-cause unclear after 3 cycles → escalate to team

