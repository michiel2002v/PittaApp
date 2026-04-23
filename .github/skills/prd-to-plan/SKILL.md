---
name: prd-to-plan
description: Turn a PRD into a multi-phase implementation plan using tracer-bullet vertical slices, saved as a local Markdown file in ./plans/. Also creates the feature file and identifies architecture/ADR requirements. Use when user wants to break down a PRD, create an implementation plan, plan phases from a PRD, or mentions "tracer bullets".
---
trig: break-down-PRD·create-implementation-plan·plan-phases·tracer-bullets
in: PRD-in-context·codebase

## Process

### 1. Confirm the PRD is in context
PRD should be in the conversation. If not, ask the user to paste it or point to the file.

### 2. Explore the codebase
Understand current architecture, existing patterns, and integration layers.
- Read `docs/architecture/ARCHITECTURE.md` — understand current components and design.
- Read `docs/architecture/adr/` — note existing architectural decisions; do not re-open settled ones.
- Read `SECURITY.md §1` — understand current asset list and risk context.

### 3. Create or locate the feature file
Before producing a plan:
1. Check `docs/features/` for a matching `xxx-FeatureName.md` file.
2. **If missing:** Create it by copying `docs/features/FEATURE_TEMPLATE.md`.
   - Name it with the next available 3-digit sequence number: `NNN-FeatureName.md`
   - Fill in §1 (Feature Description) from the PRD content.
   - Fill in §2 (Technical Impact) based on codebase exploration.
   - Mark §3, §4, §5 as `<!-- TODO: complete before Design Gate -->` — these require Security Champion input.
   - Prompt the user: "§3 Security Impact, §4 Asset & Risk Changes, and §5 Environment Separation must be completed (with Security Champion) before design work begins."
3. **If exists:** Verify §1 is consistent with the PRD. Note any gaps for the user.

### 4. Identify durable architectural decisions
Before slicing, note decisions unlikely to change: route structures, DB schema shape, key models, auth approach, third-party boundaries.

For each significant decision, determine if an ADR is needed:
- A decision qualifies for an ADR if it involves: technology choice, auth/authz model change, data model change across features, new external integration, or security trade-offs.
- List candidate ADRs in the plan output under `[ARCH]`.
- Assign next sequential ADR number(s) from `docs/architecture/adr/`.

### 5. Identify ARCHITECTURE.md update requirements
List which sections of `docs/architecture/ARCHITECTURE.md` need updating:
- New components to add to the Components table
- New risk mitigations to add to the Risk Mitigations table (with ADR references)
- Data flows to add or update
- Security Design Checklist items to mark

Include this as an `[ARCH-UPDATE]` section in the plan header.

### 6. Draft vertical slices
Break the PRD into **tracer bullet** phases — each a thin vertical slice through ALL layers (schema, API, UI, tests). See [REFERENCE.md](REFERENCE.md) for slice rules and the plan file template.

For each slice, note:
- Which ARCHITECTURE.md sections it touches
- Which ADRs it depends on or triggers
- Which risk register entries it affects

### 7. Quiz the user
Present phases as a numbered list (title + user stories covered). Ask:
- Does granularity feel right? Should any phases merge or split?
- Are the identified ADR decisions correct?
- Are the architecture update requirements complete?

Iterate until approved.

### 8. Write the plan file
Create `./plans/` if needed. Write `./plans/{feature-name}.md` using the template in [REFERENCE.md](REFERENCE.md).

Include at the top of the plan:
```
Feature file: docs/features/xxx-FeatureName.md
Architecture updates required: [list from step 5]
ADRs to create: [list from step 4]
Analysis Gate: ✅ feature file created | ⚠️ §3/§4/§5 pending Security Champion review
```

### 9. Create ADR stubs (if any)
For each ADR identified in step 4:
- Create `docs/architecture/adr/ADR-XXX-short-title.md` from `ADR_TEMPLATE.md`
- Fill in: Status = `Proposed`, Context section, and the decision under consideration
- Leave Rationale and Consequences for the design review session
- Reference the ADR stub in the feature file §4.3
