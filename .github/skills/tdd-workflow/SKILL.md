---
name: tdd-workflow
description: Red-green-refactor TDD cycle for all features and fixes. Use when implementing any feature, fixing a bug, or any time §4.Tst gate applies.
---
trig: ∀feat·∀fix·∀impl·§4.Tst
in: requirement|bug-report|spec

## Cycle: red → green → refactor → red. Exit when ∀spec-covered.

1. **test-design** — write test expressing desired behavior
   - name: `Method_Scenario_Expected` · AAA · 1assert-per-act · ∅logic-in-test
2. **red** — run test → must fail. If it passes before impl → test is wrong → rewrite.
3. **interface-design** — define public API from test shape. pub-ret explicit · null@bound · DTO≠dom≠val.
4. **green** — minimal impl to pass test. ∅over-engineer · ∅skip-to-green.
5. **refactor** — improve impl under green tests. DRY · extract · rename. ∀test still pass.
6. **repeat** → next behavior → step 1.

## Rules
- ∅impl-w/o-failing-test — test-first ∀feat+fix
- behav≠impl — test behavior not implementation details
- determ — tests must be deterministic
- edges: empty/bounds/concurrency/network
- untested → block commit

## Verify
- ∀test fail before impl (red witnessed)
- ∀test pass after impl (green confirmed)
- cov:∆≥80% · crit-path=100% · ∅coverage-gaming

## Fail
- test passes before impl → test is wrong → rewrite test
- can't make test fail → spec already satisfied → tighten spec
- green requires >50LOC → scope too large → split test

