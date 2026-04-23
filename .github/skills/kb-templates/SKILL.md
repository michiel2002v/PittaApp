---
name: kb-templates
description: Provides canonical formats for KB entries, ADRs, playbooks, tasklog, handoff, and lessons. Use when creating any new KB entry, ADR, playbook, tasklog entry, handoff document, or lesson record.
---
trig: §6.fmt·new-KB-entry·new-ADR·new-playbook·new-tasklog·new-handoff·new-lesson
in: event|decision|incident|task-completion

See [REFERENCE.md](REFERENCE.md) for all format templates.

## Quick Formats

**Tasklog**: `[UTC][#{N}T]|Status|Commit:{s}|Scope|KB-refs|Evidence/Gates|Reviews:Np/Mf|Next|Resume`

**Handoff**: `objective·state·risks·next-steps·files·tools·gates·review·branch·#{N}.{s}·uncommitted=0`

**Lessons**: `[Date][Pattern]|root-cause|KB-ref|rule-derived|trigger-condition|gate-added`

## Classification Rules
- K=verified: source∧reproducible · I=derived: source∧logic · S=hypothesis: ∅promote silently
- ∅silent-promote — log evidence at each K/I/S transition
- Lifecycle: >60d→stale · dup→merge · inv2×→rewrite · review/5tasks

