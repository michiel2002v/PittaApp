---
name: workflow-external-review
description: Reviews a pull request from an external author using the full §5 review cycle with mandatory security review. Use when reviewing a PR not authored by the team or when a review-ext task is assigned.
---
trig: external-PR-review·review-ext·reviewing-code-not-authored-by-team
in: PR-diff·PR-description·PR-author-context

## Sequence
1. **read-context** — read PR description, linked issue, goals · read full diff before commenting
2. **§5.review** — ∥(reviewer + security-reviewer.mandatory)
   - reviewer: code-review skill phases 1-5
   - security-reviewer: security-audit phases 1-4
3. **merge-verdicts** — use engine-review-synthesis if multi-model · surface conflicts
4. **respond** — structured feedback:
   - **Blockers**: must-fix before merge
   - **Suggestions**: should-fix, justified
   - **Questions**: clarification needed
   - **Praise**: what's done well
5. **follow-up** — re-review after author addresses feedback

## Gates
- security-reviewer mandatory (∅optional)
- ∅merge with open blockers · ∅approve code you don't understand

## Abort
- PR scope too large (>500 LOC undocumented) → request split
- missing context → request description before reviewing

