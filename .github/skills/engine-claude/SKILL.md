---
name: engine-claude
description: Invokes Claude sonnet or haiku as a delegated engine with scoped tool access, budget, and fallback. Use when §7e engine dispatch selects Claude for a medium or simple task.
---
trig: §7e.engine-dispatch·claude-model-delegation·sonnet-task·haiku-task
in: prompt·model(sonnet|haiku)·allowedTools·working-dir·budget-usd·timeout

## Steps
1. **validate** — model ∈ {sonnet,haiku} · allowedTools matches §7a access · ∅opus delegation
2. **construct** — `claude -p --model {m} --allowedTools "{tools}" --output-format json --no-session-persistence --max-budget-usd {$} --fallback-model haiku`
3. **invoke** — pipe prompt via stdin, capture stdout+stderr, enforce timeout (120s)
4. **parse** — extract JSON result field, validate against schema if set
5. **safety-check** — ∅secrets in output · ∅out-of-scope modifications
6. **log** — `[UTC][#{N}T.engine:claude-{model}]|status|duration|budget|tools`

## Access Mapping
| Agent Access | allowedTools |
|---|---|
| RO | `Read,Grep,Glob` |
| r+t | `Read,Grep,Glob,Bash` |
| w(src,test,cfg) | `Read,Edit,Write,Bash,Glob,Grep` |

## Fallback
sonnet → haiku → opus(manual)

## Fail
timeout→kill→fallback · budget-exceeded→fallback · secrets→BLOCK→@agt:sec-rev

