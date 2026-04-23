---
name: commit-workflow
description: Enforces the AOP commit sequence using Conventional Commits. Use when starting a new branch, making a first commit, or following §3 commit sequence rules.
---
trig: §3.seq·new-branch·first-commit·commit
in: #{N}·task-scope

## Commit Format (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body — what and why, not how]

[optional footers — BREAKING CHANGE: / Closes #N]
```

## Commit Sequence

| Step | Type | Purpose |
|------|------|---------|
| 1 | `docs(plan): #{N} approach for <feature>` | Plan commit — write todo.md. ∅prod code. |
| 2 | `test(<scope>): #{N} <scenario> spec` | Test commit (red) — ∀test must fail. |
| 3 | `feat(<scope>): #{N} <description>` | Impl commit (green) — ∀test must pass. |
| 4 | `refactor(<scope>): #{N} <description>` | Refactor — ∀test still pass. Optional. |
| 5 | `docs(<scope>): #{N} update CHANGELOG and xml-doc` | Final docs commit. |
| rev | `revert: revert "<original subject>"` | Body must contain `This reverts commit <sha>.` + reason. |

## Type → Version Impact
| Type | SemVer bump | Triggers release |
|------|-------------|-----------------|
| `feat` | minor | yes |
| `fix` / `perf` / `revert` | patch | yes |
| `feat!` / `BREAKING CHANGE:` footer | major | yes |
| `docs` / `refactor` / `test` / `chore` / `ci` / `build` | none | no |

## Rules
- ∀commit → valid Conventional Commits format (enforced by semantic-release)
- test-commit(2) < impl-commit(3) — test must precede implementation
- 1c = 1 logical unit — ∅bundling unrelated changes
- Breaking changes: use `!` suffix (`feat!:`) OR `BREAKING CHANGE: <desc>` in footer
- ∅freeform messages — `git log` must be machine-readable by semantic-release
- ∅manual version bumps — CI owns the version

## Verify
`git log --oneline` → all messages parseable? test<impl? ∅gap? story coherent?

## Fail
- freeform message → reword with `git commit --amend` (unpushed) or note in PR
- wrong ordering (impl before test) → revert → split correctly
- revert.depth > 2 → abandon + handoff

