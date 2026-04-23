---
name: workflow-docs
description: Documentation-only change flow — identify, write, and review without touching source code. Use when only README, API docs, architecture docs, or inline xml-doc need updating.
---
trig: docs-only-change·README-update·API-docs·§2.docs
in: doc-scope·changed-files

## Sequence
1. **identify** — which docs? README / API guide / architecture / inline xml-doc
2. **write** — update content: what+why · ∅stale content · ∅obvious statements
3. **review** — @agt:reviewer (1 cycle · §4b.Doc-only): accuracy, clarity, ∅broken links

## Gates
- ∅code changes in this branch
- Doc gate §4b passes (1 cycle minimum)
- ∅stale references

## Abort
- doc change requires code change → separate branch for code → merge first

