---
name: workflow-merge
description: Branch merge and conflict resolution — assess divergence, resolve conflicts with intent, test, and review. Use when a branch needs to be merged or conflicts need resolution.
---
trig: merge-needed·rebase-needed·conflict-resolution·§2.merge
in: source-branch·target-branch·conflict-list

## Sequence
1. **assess** — `git log --oneline source..target` · identify conflicting files
2. **resolve** — understand both sides per conflict · prefer SRP > DRY > perf · ambiguous → ask
3. **test** — `dotnet build` → 0warn · `dotnet test` → ∀pass · `pnpm run build` + lint (if frontend)
4. **commit** — ∅reformat commit message (§3) · ∅squash — preserve full history
5. **review** — @agt:reviewer (1 cycle): verify no accidental reversions, no silent logic conflicts

## Gates
- ∀tests pass post-merge · ∅accidental reversion · build: 0warn

## Abort
- can't understand conflict intent → pause · ask for domain context
- merge introduces systemic failures → revert → split into smaller merges

