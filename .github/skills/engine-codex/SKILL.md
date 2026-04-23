---
name: engine-codex
description: Invokes Codex CLI for code synthesis or review with sandboxed workspace access. Use when §7e engine dispatch selects Codex for a medium synthesis or review task.
---
trig: §7e.engine-dispatch·codex-eligible-task·green-phase·code-review-request
in: task-type(exec|review)·prompt·working-dir·sandbox(read-only|workspace-write)·timeout

## Steps
1. **validate** — codex available · working-dir is git repo · sandbox matches §7a access
2. **construct**
   - exec: `codex exec -C {dir} -s {sandbox} --full-auto --json "{prompt}"`
   - review: `codex review --uncommitted -C {dir} --json`
3. **invoke** — execute, capture JSONL stdout+stderr, enforce timeout (120s)
4. **parse** — filter JSONL for response events, extract files-modified+reasoning
5. **safety-check** — ∅secrets · ∅out-of-scope modifications · diff against pre-state
6. **log** — `[UTC][#{N}T.engine:codex]|task-type|status|duration|sandbox|files`

## Access Mapping
| Agent Access | Sandbox |
|---|---|
| RO \| r+t | `-s read-only` |
| w(src,test,cfg) | `-s workspace-write` |

## Fail
timeout→kill→fallback · secrets→BLOCK · out-of-scope→revert→escalate

