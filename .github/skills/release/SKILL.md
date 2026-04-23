---
name: release
description: Full release lifecycle — readiness check, semver, changelog, tagging, deploy strategy, and post-deploy verification. Use when planning a release, bumping a version, or deploying to production.
---
trig: §3.DEPLOY·release-planned·version-bump-needed·deploy-to-prod
in: release-scope·version·deploy-target

See [REFERENCE.md](REFERENCE.md) for full step-by-step procedure.

## Steps (summary)
1. **prepare** — all PRs merged · ∀§4 gates pass · dep audit clean · security audit done
2. **version** — semver: breaking→MAJOR · new-feature→MINOR · bugfix→PATCH · tag: `vX.Y.Z`
3. **changelog** — group by type (Features/Fixes/Refactors/Breaking) · update CHANGELOG.md
4. **tag-and-build** — `git tag -a vX.Y.Z` · build from tag · smoke test artifact
5. **deploy** — **rollback-plan BEFORE deploy** · strategy: canary/blue-green/rolling · ∅big-bang · feature-flags for risky
6. **verify** — healthchecks · metrics within baseline · smoke tests · hold period
7. **finalize** — update kb/quality-baselines.md · close milestone · announce

## Rules
- rollback-plan exists BEFORE deploy — hard constraint
- ∅big-bang · ∅skip verification · breaking changes need completed deprecation cycle

## Fail
- healthcheck fails → execute rollback → investigate
- metrics degrade → rollback → root-cause via debugging skill
- rollback fails → escalate immediately → incident response

