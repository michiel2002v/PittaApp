---
name: domain-template
description: Blank language-specific §4a gate overlay template. Use when a new project language is detected and no domain-{lang}.md skill exists yet.
---
trig: new project language detected · ∅existing domain-{lang}.md
in: detected language/framework

Copy this template and fill in the language-specific details. Name the skill `domain-{lang}`.

## Template

```
trig: {file-pattern} detected · lang={language}
overlay-on: §4a core gates. Apply WITH core.

Val+: {language-specific linting/formatting}
Cor+: {language-specific build/compile rules}
Sec+: {language-specific security anti-patterns}
Typ+: {language-specific type system rules}
Tst+: {language-specific test framework rules}
Perf+: {language-specific performance patterns}
Abs+: {language-specific abstraction boundaries}
Mnt+: {language-specific maintainability rules}
MIG+: {language-specific migration tooling}

ver: {build-cmd} → 0warn · {test-cmd} → ∀pass · {lint-cmd} → clean
```

## Rules
- Only add items not covered by core §4a gates
- Use + suffix to indicate overlay (additive)
- Name the skill: `domain-{lang}`
- Register in agent-registry when used 3+ times

