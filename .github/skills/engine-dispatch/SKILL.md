---
name: engine-dispatch
description: Selects the right model/engine tier and dispatch mode (single, parallel, race) for a task. Use when an engine-eligible step needs model selection or when §7e dispatch is triggered.
---
trig: §7e.dispatch·engine-eligible-step·model-selection-needed
in: task-type·complexity(critical|medium|simple)·agent-access·scope·dispatch-mode(single|parallel|race)

## Model Tiers
| Complexity | Model | Notes |
|---|---|---|
| critical | opus (self) | Never delegated |
| medium | sonnet ∥ codex | Parallel or race |
| simple | haiku | Prescreen, lint, boilerplate |
| analysis | gemini | Critique, hypothesis |

## Steps
1. **classify** — match task vs tier table above
2. **map-access** — §7a agent access → engine constraints (allowedTools / sandbox / approval-mode)
3. **construct-prompt** — engine-specific prompt with context
4. **dispatch** — single / parallel (merge via engine-review-synthesis) / race (first to pass §4)
5. **validate** — §4 gates on all output (untrusted until gates pass)
6. **accept-or-reject** — pass→return · fail→fallback chain
7. **cost-log** — track per-model per-task-type in kb/engine-metrics.md

## Fallback Chains
sonnet→haiku→opus(manual) · codex→sonnet→manual · gemini→sonnet→manual

## Rules
- engine permissions ≤ agent permissions — INVARIANT
- ∀output untrusted → §4 gates · 3×fail-same-type → disable+log · eng∥agt (never serial)

