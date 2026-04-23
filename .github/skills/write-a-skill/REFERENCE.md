# write-a-skill Reference

## Description Requirements

The description is **the only thing your agent sees** when deciding which skill to load.

**Goal**: Give your agent just enough info to know:
1. What capability this skill provides
2. When/why to trigger it (specific keywords, contexts, file types)

**Format**:
- Max 1024 chars · Write in third person
- First sentence: what it does
- Second sentence: "Use when [specific triggers]"

**Good example**:
> Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when user mentions PDFs, forms, or document extraction.

**Bad example**:
> Helps with documents.

The bad example gives the agent no way to distinguish this from other document skills.

## Supporting Files

A skill directory can contain **any number of files of any type**:

| File pattern | Purpose |
|---|---|
| `SKILL.md` | Main instructions — required, ≤100 lines |
| `*.md` | Reference docs, templates, examples — name descriptively |
| `scripts/*.js` / `scripts/*.py` / etc. | Utility scripts for deterministic operations |
| `templates/*` | Reusable templates (markdown, JSON, YAML, etc.) |
| `schemas/*` | JSON schemas, OpenAPI specs, etc. |
| Any other file | Whatever the skill needs |

**Add scripts/additional files when:**
- Operation is deterministic (validation, formatting, generation)
- Same code would be generated repeatedly
- Errors need explicit handling
- Templates would otherwise be embedded inline

**Link to them from SKILL.md:**
```
See [REFERENCE.md](REFERENCE.md)
See [templates/issue.md](templates/issue.md)
Run [scripts/validate.js](scripts/validate.js)
```

## When to Split SKILL.md

Split content into separate files when:
- SKILL.md would exceed 100 lines
- Content has distinct domains (separate concerns)
- Advanced features are rarely needed (progressive disclosure)
- Reusable templates that callers fill in

Name files descriptively — `TEMPLATES.md`, `EXAMPLES.md`, `GATES.md`, `SCHEMAS.md` etc. are all valid.

## Review Checklist
- [ ] Description includes "Use when..." with specific triggers
- [ ] `trig:` defined · `in:` defined
- [ ] SKILL.md ≤100 lines
- [ ] All supporting files linked from SKILL.md
- [ ] No time-sensitive info · consistent terminology
