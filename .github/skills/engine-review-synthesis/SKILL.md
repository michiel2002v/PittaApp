---
name: engine-review-synthesis
description: Merges and deduplicates review outputs from multiple engines/models into a single verdict. Use when parallel or multi-model review results need to be combined.
---
trig: §5.parallel-review·multi-engine-review·multi-model-review
in: review-outputs[]·source-engines[]

## Steps
1. **collect** — gather all engine/model review outputs (opus + sonnet + codex + gemini)
2. **normalize** — convert to common format: `{file, line, severity, phase(§4), description, source}`
3. **deduplicate** — same file+line+issue from multiple engines → merge, note "confirmed by N engines"
4. **surface-conflicts** — engines disagree on severity → flag for human review, ∅auto-resolve
5. **synthesize** — union of all findings · highest severity wins · PASS only if ∀agree + §4 pass
6. **report** — findings by §4 phase · source attribution · conflicts section · agreement stats

## Rules
- ∅silently drop findings · severity = max(all engines) · conflicts → surface
- opus verdict authoritative when engines conflict
- §4 gates override all engine verdicts (ground truth)

