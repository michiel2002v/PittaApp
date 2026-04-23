---
name: prd-to-issues
description: Break a PRD into independently-grabbable GitHub issues using tracer-bullet vertical slices. Use when user wants to convert a PRD to issues, create implementation tickets, or break down a PRD into work items.
---
trig: PRD-to-issues·create-tickets·break-down-PRD·implementation-tickets
in: PRD-issue-number-or-URL·codebase

## Process

### 1. Locate the PRD

Ask the user for the PRD GitHub issue number or URL. Fetch with `gh issue view <number>` (with comments) if not in context.

### 2. Explore the codebase (optional)

Understand the current state of the code if not already explored.

### 3. Draft vertical slices

Break the PRD into **tracer bullet** issues — each a thin slice cutting through ALL layers end-to-end (schema, API, UI, tests), NOT a horizontal layer slice.

Slices are either **HITL** (requires human interaction) or **AFK** (can be fully implemented without human interaction). Prefer AFK over HITL.

Each slice must be: narrow but COMPLETE · demoable/verifiable on its own · prefer many thin over few thick.

### 4. Quiz the user

Present the breakdown as a numbered list. For each slice show: Title · Type (HITL/AFK) · Blocked by · User stories covered.

Ask: granularity right? dependencies correct? anything to merge/split? correct HITL/AFK classification?

Iterate until approved.

### 5. Create the GitHub issues

Use `gh issue create` for each approved slice in dependency order (blockers first). Use the template in [templates/issue.md](templates/issue.md).

Do NOT close or modify the parent PRD issue.
