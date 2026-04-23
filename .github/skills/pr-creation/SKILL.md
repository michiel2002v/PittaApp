---
name: pr-creation
description: Assembles and submits a pull request after verifying commit sequence, gate status, and PR description quality. Use when a feature is complete and ready to merge, or when §3.PR step is reached.
---
trig: §3.PR·feature-complete·ready-for-merge·all-gates-pass
in: #{N}·branch·commit-history·§5-review-status

## Steps
1. **pre-flight** — `git status` clean · `git log #{N}`: sequential, test<impl, 1c/unit · §5≥2P · §4∀pass · branch up-to-date
2. **size-check** — >10 files or >500 LOC → consider stacked PRs
3. **write description** — title: `#{N} summary` (<70 chars) · body: use [templates/pr-body.md](templates/pr-body.md)
4. **label-and-link** — type label (feat/fix/refactor/…) · size · issue link · reviewers
5. **submit** — push, create PR, verify CI passes

## PR Body Checklist
- [ ] §4 gates pass · [ ] Tests pass · [ ] Docs updated
- [ ] No secrets/PII in diff · [ ] Breaking changes documented

## Rules
- ∅PR without §5 review passing · ∅PR with failing CI
- one concern per PR — ∅mixed feature+refactor+fix

## Fail
- CI fails after creation → fix on branch → push → verify
- PR too large → close → split → resubmit
- Review feedback → new commits (∅force-push over review comments)

