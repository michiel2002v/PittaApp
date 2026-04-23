---
name: write-a-prd
description: Create a PRD through user interview, codebase exploration, and module design, then submit as a GitHub issue and create the SSDLC feature file. Use when user wants to write a PRD, create a product requirements document, or plan a new feature.
---
trig: write-PRD·create-PRD·product-requirements·plan-new-feature
in: problem-description·codebase

Go through the steps below. You may skip steps if not necessary.

1. **Ask the user** for a long, detailed description of the problem and any potential solution ideas.

2. **Explore the repo** to verify their assertions and understand the current state of the codebase.
   - Read `docs/architecture/ARCHITECTURE.md` — understand current components and existing decisions.
   - Read `docs/architecture/adr/` — note settled architectural decisions; do not re-open them.
   - Read `SECURITY.md §1` — understand current security context (asset list, risk register, threat model).
   - Read any existing `docs/features/xxx-*.md` files — understand prior feature patterns and claim the next available sequence number.

3. **Interview the user** relentlessly about every aspect of the plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies one-by-one.

4. **Sketch out the major modules** to build or modify. Look for opportunities to extract **deep modules** — ones with a simple, testable interface hiding significant complexity. Confirm with the user which modules they want tests written for.

5. **Identify security implications** during the interview. Ask specifically:
   - Does this feature handle personal data (PII)?
   - Which user roles need access?
   - Are there new external integrations or outbound calls?
   - What is the business impact if this feature fails or is breached?
   - Note these answers — they feed directly into the feature file §3.

6. **Create the GitHub issue** using `gh issue create` with the PRD. Use the template in [templates/prd-issue.md](templates/prd-issue.md).

7. **Create the feature file** in `docs/features/`:
   - Determine the next available sequence number (scan existing `docs/features/xxx-*.md` files).
   - Create `docs/features/NNN-FeatureName.md` by copying `docs/features/FEATURE_TEMPLATE.md`.
   - Fill in from PRD content and codebase exploration:
     - §1 Feature Description — user stories and acceptance criteria from the PRD
     - §2 Technical Impact — components, API changes, data model changes identified in step 4
     - §3.1 Data Classification — from security interview in step 5
     - §3.2 Authentication & Authorization — from interview
   - Mark §3.3, §3.4, §4, §5 with `<!-- TODO: complete with Security Champion before Design Gate -->`
   - Set Feature ID = `F-NNN` matching the sequence number
   - Set Status = `Draft`
   - Link the GitHub issue number in the Change History

8. **Identify architectural decisions** that will arise from this feature:
   - List any decisions that qualify for an ADR (see criteria in `AGENTS.md`).
   - Note which sections of `docs/architecture/ARCHITECTURE.md` will need updating.
   - Prompt the user: "The following architectural decisions will need ADRs before implementation begins: [list]. These will be created during the Design phase."

9. **Confirm with the user:**
   - GitHub issue created: ✅ #NNN
   - Feature file created: ✅ `docs/features/NNN-FeatureName.md`
   - §3/§4/§5 pending Security Champion review
   - Architecture/ADR work identified for Design phase
