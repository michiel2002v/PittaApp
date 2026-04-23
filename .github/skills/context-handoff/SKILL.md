---
name: context-handoff
description: Creates checkpoint saves and full handoff documents at context thresholds or session end. Use when context exceeds 60%, at session end, or when explicitly stopping work.
---
trig: §5.ctx>60%·§5.ctx>85%·session-ending·∀stop·explicit-handoff-request
in: current-task-state·uncommitted-work·decision-history

## Checkpoint (ctx>60%)
1. Commit all gated work — ∅uncommitted changes survive context loss
2. Update tasks/tasklog.md with current state
3. Note decision rationale for in-progress choices
4. Continue working — this is a save point, not a stop

## Handoff (ctx>85% | session-end | ∀stop)
1. **secure-state** — commit all passing work; verify `git status` clean
    2. **write tasks/handoff.md** — use [templates/handoff.md](templates/handoff.md) for required fields
3. **write resume-prompt** — format: `"Continue #{N}. State: [1-line]. Next: [specific action]."`
   - Must be self-contained — ∅assume prior context
4. **update tasks/tasklog.md** — final entry: `[UTC][#{N}T]|St|C:{s}|Scope|KB|Ev/Gates|Rev|Next|Resume`
5. **KB lifecycle** — update kb/index.md if new knowledge; log lessons

## Rules
- ∅uncommitted work at handoff — commit or explicitly document
- handoff.md is overwritten each stop (not appended)
- next-steps must be actionable: "implement X in Y" not "continue working"

## Fail
- uncommitted work at ctx>85% → emergency commit with WIP marker → note in handoff
- handoff too long (>50 lines) → scope was too large → note for next session to split

