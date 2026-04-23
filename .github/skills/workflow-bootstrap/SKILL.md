---
name: workflow-bootstrap
description: Greenfield project initialization — directory structure, toolchain, CI skeleton, AGENT.md, and AOP scaffold. Use when initializing a new project or repository.
---
trig: greenfield-project·new-repo-initialization·§2.bootstrap
in: project-type·tech-stack·team-conventions

## Sequence
1. **structure** — create base directory layout (src/, tests/, docs/, .github/)
   - .editorconfig, .gitignore, README.md
2. **toolchain** — configure language tooling
   - .NET: Directory.Build.props, .globalconfig, NuGet.Config
   - Frontend: package.json, tsconfig.json, eslint.config.js
3. **ci-skeleton** — minimal CI pipeline (build + test + lint/format check)
4. **AGENT.md** — document stack, conventions, build commands
5. **AOP scaffold** — create all skills, agents, kb files per scaffold spec
6. **first-commit** — `#0.1.plan:initial project scaffold`

## Gates
- `dotnet build` (or equivalent) → 0warn on empty project
- .editorconfig in place · AGENT.md populated with real build commands
- tasks/ and kb/ populated

## Abort
- existing files conflict → ∅overwrite · resolve manually · ADR if needed

