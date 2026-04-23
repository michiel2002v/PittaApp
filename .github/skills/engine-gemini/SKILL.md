---
name: engine-gemini
description: Invokes Gemini CLI for analysis, critique, or hypothesis generation tasks. Use when §7e engine dispatch selects Gemini for an analysis or critique task.
---
trig: §7e.engine-dispatch·gemini-eligible-task·analysis-task·critique-task
in: prompt·working-dir·approval-mode(plan|auto_edit)·timeout

## Steps
1. **validate** — gemini available · approval-mode matches §7a access
2. **construct** — `gemini --prompt "{p}" --approval-mode {mode} --output-format json --include-directories "{dir}"`
3. **invoke** — execute, capture JSON stdout+stderr, enforce timeout (120s)
4. **parse** — extract analysis/findings/recommendations from JSON
5. **safety-check** — ∅secrets · ∅out-of-scope modifications (if auto_edit)
6. **log** — `[UTC][#{N}T.engine:gemini]|status|duration|approval-mode|scope`

## Access Mapping
| Agent Access | Approval Mode |
|---|---|
| RO \| r+t \| r+sh | `--approval-mode plan` |
| w(src,test,cfg) | `--approval-mode auto_edit` |

## Fail
timeout→kill→fallback · secrets→BLOCK · parse-error→fallback

