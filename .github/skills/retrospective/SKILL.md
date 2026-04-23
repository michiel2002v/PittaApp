---
name: retrospective
description: Reviews recent tasklog and lessons to identify patterns worth promoting to skills, agent registry entries, or MCP servers. Use every 3-5 tasks, after a milestone, or when a recurring pattern is detected.
---
trig: §1b.evolve·every-3-5-tasks·milestone-complete·pattern-detected·post-incident
in: tasks/tasklog.md·tasks/lessons.md·kb/agent-registry.md·recent-session-history

## Steps
1. **gather** — read last 3-5 tasklog entries, recent lessons, commit patterns, gate failure frequency
2. **identify-patterns** — repeated workflow (3+) · repeated agent-use (3+) · repeated external tool · repeated failure/lesson
3. **evaluate** — frequency ≥3 + stable + ≥3 steps → promote
4. **promote** — skill→`.github/skills/{name}/SKILL.md` · agent→kb/agent-registry.md · external tool→.mcp.json
5. **update-protocol** — ∆≥3 opts→minor version · ∆break→major · ∅change without evidence
6. **record** — log in tasklog · update lessons · update kb/index.md

## Promotion Matrix
| Pattern | Frequency | Promote to |
|---------|-----------|------------|
| workflow sequence | 3+ tasks | `.github/skills/{name}/SKILL.md` |
| agent configuration | 3+ uses | `kb/agent-registry.md` (permanent) |
| external tool | repeated + shared | `.mcp.json` server |
| skill+agent+hook combo | 2+ × repo | plugin |

## Rules
- evidence-based: show the pattern in tasklog · temp→perm @3+ successful uses
- ∅over-promote: unstable patterns stay temp · promotion one-way until deprecated

## Fail
- no patterns found → normal, not every retro produces promotions
- too many patterns → prioritize by: frequency × cost

