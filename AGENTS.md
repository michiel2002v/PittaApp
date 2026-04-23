# AGENTS.md — Project Context for AI Coding Agents

> This file is loaded by all AI agents at boot. It provides project context,
> build/test conventions, prohibited patterns, and the documentation layout.

---

## Project Overview

**Project:** `<project-name>`
**Team:** `<team-name>`
**Security Champion:** `<name>`
**Project Lead:** `<name>`

This project follows an SSDLC (ISO 27001: 8.25–8.31, 8.34).
Phase gates are defined in `.github/rules/ssdlc.md`.

---

## Technology Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Backend      | `<backend technology>`         |
| Database     | `<database technology>`        |
| Auth         | `<auth provider / SSO module>` |
| CI/CD        | GitHub Actions                 |
| Secret Vault | `<secret vault technology>`    |
| Hosting      | `<hosting platform>`           |

---

## Build & Test Commands

```bash
# Build
<build command>

# Test (all)
<test command>

# Lint / format
<lint command>

# Dependency vulnerability check
<dependency CVE scan command>
```

---

## Repository Conventions

- **Branching:** `#{N}-slug` off `main`. Never commit direct to `main` or `release/*`.
- **Commits:** Conventional Commits (`feat`, `fix`, `test`, `docs`, `chore`, etc.)
- **PR:** Requires `@agt:security-reviewer` PASS + `@agt:reviewer` PASS before merge.
- **Secrets:** Never in code, config files, or logs. Use your configured `<secret vault>`.
- **Environments:** `dev`, `test`, `prod` are strictly separated.
- **Changelog:** `CHANGELOG.md` updated with every release.

---

## Prohibited Patterns

Agents must refuse to generate or accept code containing these:

- Hard-coded credentials, API keys, connection strings, tokens
- Raw query string concatenation (use parameterized queries / ORM)
- Skipping X.509 certificate validation
- Silent exception swallowing (`catch` with no log or rethrow)
- Disabling HTTPS, HSTS, or antiforgery
- Direct production environment access from development code
- Test data containing real PII
- Floating dependency versions (pin major.minor minimum)

---

## Documentation Layout

```
docs/
├── features/            # One .md file per feature — copy FEATURE_TEMPLATE.md
├── architecture/
│   ├── ARCHITECTURE.md  # Updated per feature / component change
│   ├── DATA_FLOWS.md
│   └── adr/             # One ADR per significant design decision
├── operations/
│   ├── DEPLOYMENT.md
│   └── MAINTENANCE.md
└── policies_and_procedures/
```
