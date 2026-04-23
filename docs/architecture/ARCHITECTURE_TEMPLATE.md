# Architecture

> SSDLC Phase: Design | Required by ISO 27001: 8.27
> Updated: per significant design change

---

## System Overview

<!-- Describe the system: purpose, users, key capabilities -->

**Project:** `<project name>`
**Version:** `<version>`
**Date:** `YYYY-MM-DD`

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        User Layer                            │
│  [Web Browser / Mobile App / API Consumer]                   │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS (TLS 1.2+)
┌───────────────────────▼──────────────────────────────────────┐
│                     API Gateway / Load Balancer              │
│  (Auth token validation, rate limiting)                      │
└───────────────────────┬──────────────────────────────────────┘
                        │ Internal TLS
        ┌───────────────▼──────────────────┐
        │        Application Service         │
        │  - <Backend framework>             │
        │  - Auth (<auth provider / SSO>)    │
        │  - RBAC + least privilege          │
        └──────┬─────────────────┬───────────┘
               │                 │
     ┌─────────▼──────┐  ┌───────▼───────────┐
     │  <Database>     │  │  External APIs /   │
     │  (<data layer>) │  │  Integrations      │
     └─────────────────┘  └────────────────────┘
               │
     ┌─────────▼──────────┐
     │   <Secret Vault>    │
     │  (Secrets / Keys)   │
     └────────────────────┘
```

<!-- Adapt diagram above. Mark all trust boundaries. -->

---

## Components

| Component          | Technology            | Responsibility                         | Security notes                        |
|--------------------|-----------------------|----------------------------------------|---------------------------------------|
| API Layer          | `<API framework>`     | Request handling, routing, validation  | Antiforgery on mutations; HTTPS only  |
| Auth               | `<auth provider>`     | Authentication, token validation       | Role-based claims; short TTL          |
| Business Logic     | `<language / runtime>`| Domain logic, orchestration            | No external I/O direct; DI            |
| Data Access        | `<ORM / DB driver>`   | Persistence                            | Parameterized queries only; no raw query concatenation |
| Secret Management  | `<secret vault>`      | Store secrets, connection strings      | Never in code or config files         |
| CI/CD              | GitHub Actions        | Build, test, deploy                    | SAST, secret scan, DAST gates         |

---

## Risk Mitigations (from Risk Register)

> Each risk in `SECURITY.md §1.2` must be traceable to an architectural decision here.

| Risk ID | Risk Description               | Architectural Mitigation                              | ADR Reference     |
|---------|--------------------------------|-------------------------------------------------------|-------------------|
| R-001   | Unauthorized access            | SSO + RBAC at service layer + audit logging           | `adr/ADR-001.md`  |
| R-002   | Query injection                | ORM only; no raw query concatenation enforced by linter + review |       |
| R-003   | Credential leakage             | Secret vault; secret scanner in CI/CD                 |                   |
| R-004   | PII in logs                    | Structured logging config; PII fields excluded        |                   |
| R-005   | Vulnerable dependencies        | Pinned deps; automated CVE scanning in CI/CD          |                   |

---

## Security Design Checklist

The following areas must be addressed before the Design Gate passes:

- [ ] User account and permission management — RBAC design documented above
- [ ] Data input validation — DTO validation at API entry
- [ ] Data flow control — data flows documented in `DATA_FLOWS.md`
- [ ] Data output protection — no internal data in error responses
- [ ] System interfaces — external integrations listed in components table
- [ ] Reporting — audit log access defined
- [ ] Restart and recovery procedures — `docs/operations/DEPLOYMENT.md` § Rollback
- [ ] Logging (transactions and access) — structured logging; mutations logged with user context
- [ ] Non-repudiation — audit trail on all state-changing operations
- [ ] Ongoing patching — automated CVE scanning in pipeline
- [ ] Use of cryptography — `<secret vault>`; TLS 1.2+; encrypted PII at rest
- [ ] Digital certificates and signatures — TLS certs managed via `<certificate manager>`; automated renewal

---

## Data Flows

See [`DATA_FLOWS.md`](DATA_FLOWS.md) for detailed data flow diagrams and interface specifications.

---

## Architecture Decisions

See [`adr/`](adr/) for Architecture Decision Records.

---

## Change History

| Date       | Version | Author | Description                     |
|------------|---------|--------|---------------------------------|
| YYYY-MM-DD | 1.0     |        | Initial architecture document   |
