---
name: kb-prune
description: Scans the knowledge base for stale, duplicate, or invalidated entries and prunes, merges, or rewrites them. Use every 5 tasks, when entries are flagged >60d, or when explicitly requested.
---
trig: §6.lifecycle·rev/5tasks·>60d-flag·explicit-prune-request
in: kb/index.md·kb/**/*.md·tasks/lessons.md·tasks/tasklog.md

## Steps
1. **scan** — flag: >60d modified (stale) · S-class >30d (promote or remove) · 0 tasklog refs (unused)
2. **assess** — for each flagged entry: still accurate? still relevant? duplicated? classification correct?
3. **act** — stale+accurate→update date · stale+inaccurate→rewrite · irrelevant→archive · duplicate→merge · S >30d no evidence→remove
4. **ADR maintenance** — ∅delete ADRs (deprecate only) · review trigger conditions on Accepted ADRs
5. **update-index** — refresh kb/index.md + kb/memory-map.md · log in tasklog
6. **metrics** — entries before/after · avg age · % verified in 30d · update kb/quality-baselines.md

## Rules
- review every 5 tasks · >60d → dormant
- invalidated 2× → full rewrite · ∅delete ADRs · ∅silent promote K/I/S
- merge > delete — preserve knowledge

## Fail
- can't determine accuracy → flag for domain expert review
- too many entries → prioritize: age desc, S-class first

