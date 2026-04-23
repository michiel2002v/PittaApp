# PittaApp 🥙

Web app to replace the Pitta Moestie Excel — orders, items, payments, debt tracking.

## Quick start (Docker)

```powershell
copy .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5080/health
- Postgres: localhost:5432 (user/pass: `pittaapp`)

## Local development (SSO login flow)

You need: .NET 10 SDK, Node 22, PostgreSQL via `docker compose up -d db`.

```powershell
# Backend (HTTP on 5080)
cd backend\PittaApp.Api
dotnet run

# Frontend (HTTP on 5173; in a separate terminal)
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

### Entra ID app registration

Under **Authentication → Add a platform → Web**, add:

- Redirect URIs:
  - `http://localhost:5173/signin-oidc`
  - `http://localhost:5080/signin-oidc`
- Front-channel / post-logout redirect URIs:
  - `http://localhost:5173/signout-callback-oidc`
  - `http://localhost:5080/signout-callback-oidc`

Client secret is stored locally via `dotnet user-secrets` (key `AzureAd:ClientSecret`).

## Project layout

- `backend/` — .NET 10 ASP.NET Core minimal API
- `frontend/` — React + TypeScript (Vite)
- `docs/features/` — feature specifications (SSDLC)
- `docker-compose.yml` — full local stack

---

# Capture.Agents.Template

> Monorepo template for GitHub Copilot agents, skills, and SSDLC rules.
> Fork this repo as the starting point for a new project — fill in `AGENTS.md`, `SECURITY.md`, and `docs/features/`.

---

## Agents

Agents are specialist AI personas in `.github/agents/`. Each has a defined charter, access level, skill set, and escalation path. Agents are dispatched by `aop-optimised` according to task type.

| Agent | Description |
|---|---|
| `planner` | Task decomposition and planning — read-only source access |
| `planner-assistant` | Planning specialist: feature docs, architecture, ADRs |
| `implementer` | TDD code writer — source, tests, config within scope only |
| `reviewer` | Code quality verification — runs §4 review gates |
| `security-reviewer` | Security audit — mandatory on every code change |
| `critic` | Adversarial plan analysis — exactly 3 failure modes |
| `debugger` | Evidence-first root-cause analysis — reproduce, isolate, verify |
| `refactorer` | Pure structural improvement — behavioral equivalence enforced |
| `api-architect` | Contract-first API design — OpenAPI spec before implementation |
| `infra-ops` | CI/CD and infrastructure — pipelines, deploy config, IaC |
| `release-coordinator` | Full release lifecycle — readiness gate, semver, changelog, deploy |
| `kb-curator` | Knowledge base maintenance, retrospectives, handoff documents |
| `engine-dispatcher` | External model/engine orchestration — Claude, Codex, Gemini |

---

## Skills

Skills are reusable instruction sets in `.github/skills/`. Agents and users invoke them by name.

### Workflows

| Skill | Description |
|---|---|
| `workflow-feature` | End-to-end feature delivery — plan, branch, TDD, review, PR |
| `workflow-hotfix` | Production bugfix — branch, TDD fix, review, cherry-pick |
| `workflow-migration` | Safe DB migration — ADR, up/down, idempotency, separate data/schema |
| `workflow-merge` | Branch merge and conflict resolution |
| `workflow-docs` | Documentation-only change flow |
| `workflow-config` | Config-only change flow with secrets scan |
| `workflow-bootstrap` | Greenfield project initialisation — structure, toolchain, CI skeleton |
| `workflow-external-review` | Full §5 review cycle for PRs from external authors |

### Planning & Design

| Skill | Description |
|---|---|
| `task-triage` | Classify task type and select dispatch path — always the first step |
| `write-a-prd` | Create a PRD via user interview + codebase exploration |
| `prd-to-plan` | Turn a PRD into a multi-phase implementation plan |
| `prd-to-issues` | Break a PRD into independently-grabbable GitHub issues |
| `api-design` | Contract-first API design — OpenAPI spec + contract tests first |
| `design-an-interface` | Generate multiple radically different interface designs in parallel |
| `request-refactor-plan` | Create a refactor plan with tiny commits via user interview |
| `ubiquitous-language` | Extract a DDD-style ubiquitous language glossary |
| `grill-me` | Relentless interview to stress-test a plan or design |

### Code Quality & Review

| Skill | Description |
|---|---|
| `code-review` | All §4 review gates in strict order — short-circuits on phase-1 failure |
| `tdd` | Test-driven development with red-green-refactor loop |
| `tdd-workflow` | Red-green-refactor TDD cycle for all features and fixes |
| `refactoring` | Disciplined structural improvement under behavioral equivalence |
| `debugging` | Evidence-first root-cause — reproduce, isolate, ≥2 hypotheses, verify |
| `triage-issue` | Triage a bug, find root cause, create GitHub issue with TDD fix plan |
| `improve-codebase-architecture` | Find opportunities to deepen shallow modules |
| `qa` | Conversational QA session that files GitHub issues |

### Security

| Skill | Description |
|---|---|
| `security-audit` | Secrets scan, dependency CVEs, injection review, auth/authz, GDPR |
| `security-review` | AI-powered codebase scanner — traces data flows, catches OWASP Top 10 |
| `secret-scanning` | GitHub secret scanning, push protection, custom patterns |
| `gdpr-compliant` | GDPR-compliant engineering — PII, retention, audit trails, consent |
| `dependency-audit` | Vulnerabilities, freshness, license compliance, floating versions |
| `dependabot` | Configure and manage GitHub Dependabot |

### Release & Git

| Skill | Description |
|---|---|
| `release` | Full release lifecycle — semver, changelog, tagging, deploy, verify |
| `pr-creation` | Assemble and submit a PR after gate verification |
| `commit-workflow` | AOP commit sequence using Conventional Commits |
| `conventional-commit` | Generate structured Conventional Commit messages |
| `git-guardrails-claude-code` | Claude Code hooks to block destructive git commands |

### Domain — .NET / C#

| Skill | Description |
|---|---|
| `domain-dotnet` | §4a gate overlays for C# — format, nullable, async, EF Core, logging |
| `dotnet-best-practices` | .NET code quality — SOLID, DI, logging, error handling, async |
| `aspnet-minimal-api-openapi` | ASP.NET Minimal API endpoints with OpenAPI documentation |
| `ef-core` | Entity Framework Core — DbContext, relationships, queries, migrations |
| `csharp-async` | C# async/await — pitfalls, Task/ValueTask, cancellation tokens |
| `csharp-xunit` | xUnit testing — Fact/Theory, fixtures, Moq/NSubstitute |
| `csharp-docs` | C# XML documentation comments — summary, param, returns, exceptions |
| `dotnet-timezone` | .NET timezone handling — TimeZoneInfo, DateTimeOffset, NodaTime |
| `dotnet-upgrade` | .NET framework upgrade — TFM migration, breaking changes, CI updates |

### Domain — Python

| Skill | Description |
|---|---|
| `domain-python` | §4a gate overlays for Python — FastAPI, Alembic, uv, Pydantic, async |
| `python-best-practices` | Python code quality — SOLID, DI via Depends(), structlog, error handling |
| `fastapi-openapi` | FastAPI endpoints with OpenAPI — response_model, status_code, auth |
| `sqlalchemy-alembic` | SQLAlchemy 2.0 async ORM and Alembic migrations |
| `python-async` | Python async/await — pitfalls, TaskGroup, cancellation, async context managers |
| `python-pytest` | pytest — fixtures, pytest-asyncio, httpx, dependency_overrides, coverage |
| `python-pydantic` | Pydantic v2 — ConfigDict, validators, serializers, discriminated unions, BaseSettings |
| `python-docs` | Python docstrings — Google style, Args/Returns/Raises, interrogate enforcement |

### Domain — React / TypeScript

| Skill | Description |
|---|---|
| `domain-react` | §4a gate overlays for React + TS — strict types, TanStack, a11y, Vitest |
| `migrate-to-shoehorn` | Migrate `as` type assertions to @total-typescript/shoehorn |
| `setup-pre-commit` | Husky pre-commit hooks with lint-staged, type checking, tests |

### Knowledge Base & Context

| Skill | Description |
|---|---|
| `context-handoff` | Checkpoint saves and handoff documents at context thresholds |
| `kb-prune` | Scan KB for stale, duplicate, or invalidated entries and prune |
| `kb-templates` | Canonical formats for KB entries, ADRs, playbooks, tasklog, handoff |
| `retrospective` | Review tasklog to find patterns worth promoting to skills or MCPs |

### Engines

| Skill | Description |
|---|---|
| `engine-dispatch` | Select model/engine tier and dispatch mode (single, parallel, race) |
| `engine-claude` | Invoke Claude sonnet/haiku as a delegated engine |
| `engine-codex` | Invoke Codex CLI for code synthesis or review |
| `engine-gemini` | Invoke Gemini CLI for analysis, critique, hypothesis generation |
| `engine-review-synthesis` | Merge and deduplicate review outputs from multiple engines |

### Utilities

| Skill | Description |
|---|---|
| `create-agentsmd` | Generate a complete AGENTS.md for a repository |
| `create-readme` | Create a comprehensive README.md |
| `write-a-skill` | Create new agent skills with proper structure |
| `make-skill-template` | Create new Agent Skills for GitHub Copilot |
| `microsoft-docs` | Query official Microsoft documentation |
| `microsoft-code-reference` | Look up Microsoft API references and verify SDK code |
| `scaffold-exercises` | Create exercise directory structures with stubs and explainers |
| `edit-article` | Edit and improve articles — restructure, clarify, tighten prose |
| `mentoring-juniors` | Socratic mentoring for junior developers — guides, never answers |
| `copilot-spaces` | Load project-specific context from a Copilot Space |
| `obsidian-vault` | Search, create, and manage Obsidian vault notes |

---

## Repository Structure

```
AGENTS.md                        # AI agent boot context — fill in for your project
SECURITY.md                      # Asset list, risk register, threat model, OWASP, release checklist
docs/
├── features/                    # One .md per feature — copy FEATURE_TEMPLATE.md
├── architecture/                # ARCHITECTURE.md, DATA_FLOWS.md, adr/
└── operations/                  # DEPLOYMENT.md, MAINTENANCE.md
.github/
├── agents/                      # Agent persona files
├── skills/                      # Skill instruction sets
└── rules/
    └── ssdlc.md                 # SSDLC gate rules (ISO 27001)
```

---

## License

<!-- TODO: License -->

