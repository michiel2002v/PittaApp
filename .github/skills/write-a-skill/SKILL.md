---
name: write-a-skill
description: Create new agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, or build a new skill.
---
trig: create-skill·write-skill·new-skill·build-skill
in: skill-name·use-cases·reference-materials

## Process

1. **Gather requirements** — ask about: task/domain, use cases, need for scripts, reference materials
2. **Draft the skill** — SKILL.md (required, ≤100 lines) + any supporting files needed
3. **Review with user** — present draft, confirm coverage, ask for gaps

## Skill Structure

```
skill-name/
├── SKILL.md              # Main instructions (required, ≤100 lines)
├── *.md                  # Any number of reference/example files
├── scripts/              # Utility scripts (any language)
│   └── helper.js
└── (any other files)     # Templates, schemas, examples — no restrictions
```

## SKILL.md Template

```
---
name: skill-name
description: Brief description. Use when [specific triggers].
---
trig: trigger·other-trigger
in: context·more-context

[Instructions — keep SKILL.md under 100 lines; link out to other files for details]
```

Link to other files from SKILL.md:
```
See [REFERENCE.md](REFERENCE.md) or [templates/issue.md](templates/issue.md)
```

See [REFERENCE.md](REFERENCE.md) for description requirements, splitting rules, and the review checklist.

## Review Checklist

- [ ] Description includes "Use when..." with specific triggers
- [ ] `trig:` defined · `in:` defined
- [ ] SKILL.md ≤100 lines · no time-sensitive info
- [ ] Supporting files linked from SKILL.md
