# SECURITY.md — Security Policy, Project Analysis & SSDLC Compliance

> This document is the master security posture declaration for this repository.
> It is part of the mandatory evidence set for ISO 27001 Secure Development (8.25–8.31, 8.34).
> It is divided into three parts: **Reporting**, **Project Security Analysis**, and **SSDLC Compliance**.

---

## Reporting a Vulnerability

**Do NOT create a public GitHub issue for security vulnerabilities.**

Contact the Security Champion directly:
- **Security Champion:** `<!-- TODO: name + contact -->`

Provide: affected component, reproduction steps, potential impact, and severity estimate.
Expected response time: **≤ 5 business days** for acknowledgement.

---

## Part 1 — Project Security Analysis

> **Last reviewed:** `YYYY-MM-DD` | **Reviewed by:** `<Security Champion>`

### 1.1 Asset List

| Asset ID | Asset Name               | Type             | Data Classification  | Business Impact if Unavailable |
|----------|--------------------------|------------------|----------------------|-------------------------------|
| A-001    | `<application name>`     | Application      | Internal             | High                          |
| A-002    | `<primary database>`     | Data Store       | Confidential / PII   | Critical                      |
| A-003    | `<secret vault>`         | Credential Store | Confidential         | Critical                      |

---

### 1.2 Risk Register

> Risk Score = Likelihood (1–5) × Impact (1–5) · **🔴 Critical (15–25) · 🟠 High (10–14) · 🟡 Medium (5–9) · 🟢 Low (1–4)**

| Risk ID | Asset Ref | Threat / Vulnerability                  | L | I | Score    | Status    | Primary Mitigation                             |
|---------|-----------|-----------------------------------------|---|---|----------|-----------|------------------------------------------------|
| R-001   | A-001/002 | Unauthorized access to sensitive data   | 3 | 5 | **15** 🔴 | Mitigated | RBAC + SSO + audit logging                     |
| R-002   | A-002     | Query injection via user input          | 2 | 5 | **10** 🟠 | Mitigated | ORM / parameterized queries only               |
| R-003   | A-001/005 | Credential leakage in repository        | 2 | 5 | **10** 🟠 | Mitigated | Secret scanner in CI/CD; `<secret vault>`      |

---

### 1.3 Security Controls

| Control Area               | Implementation                                          | Risk IDs Mitigated | OWASP / ISO Ref        |
|----------------------------|---------------------------------------------------------|--------------------|------------------------|
| Authentication             | `<auth provider / SSO module>`                          | R-001              | ASVS V2, ISO 8.26      |
| Authorization              | Role-based, least privilege, service-layer RBAC         | R-001              | ASVS V4, ISO 8.26      |
| Input validation           | Schema / DTO validation at API boundary                 | R-002              | ASVS V5, Top 10 A03    |
| Query injection prevention | ORM / parameterized queries — no raw query concatenation | R-002              | ASVS V5, Top 10 A03    |
| Secret management          | `<secret vault>` — never in code or config files        | R-003              | ASVS V6, ISO 8.28      |
| Transport security         | HTTPS only, HSTS enforced, TLS 1.2+                     | R-001              | ASVS V9, ISO 8.26      |
| Logging & monitoring       | Structured logging; no PII in logs                      |                    | ASVS V7, ISO 8.26      |
| Dependency management      | Pinned versions; automated CVE scanning                 |                    | ISO 8.28               |
| SAST / DAST                | CI/CD integrated; blocks on high/critical findings      |                    | ISO 8.29               |

---

### 1.4 Environment Separation

> ISO 27001:2022 – 8.31 | No dev/test credentials, data, or config may reach production.

| Environment | Branch / Pipeline  | Data Policy                          | Secret Source          |
|-------------|-------------------|---------------------------------------|------------------------|
| `dev`       | feature branches  | Synthetic / anonymized data — no PII  | Local `.env` (gitignored) |
| `test`      | `develop` / `test`| Anonymized test data — no PII         | CI/CD env variables    |
| `production`| `main` (CD only)  | Live data; full GDPR controls         | `<secret vault>` (prod)|

---

### 1.5 Threat Model

> Update this section whenever a new feature introduces new trust boundaries or data flows.
> Use STRIDE: **S**poofing · **T**ampering · **R**epudiation · **I**nformation Disclosure · **D**enial of Service · **E**levation of Privilege

#### Trust Boundaries

| Boundary ID | From            | To                  | Protocol    | Auth Required |
|-------------|-----------------|---------------------|-------------|---------------|
| TB-001      | User (browser)  | API Gateway         | HTTPS       | Token / SSO   |
| TB-002      | API service     | Database            | Internal TLS| Service acct  |
| TB-003      | API service     | External integrations | HTTPS     | API Key / OAuth |

#### Data Flows

| Flow ID | Source | Destination | Data Classification | Notes                     |
|---------|--------|-------------|---------------------|---------------------------|
| DF-001  | User   | API         | Varies              | <!-- describe -->         |
| DF-002  | API    | Database    | Confidential / PII  | <!-- describe -->         |

#### STRIDE Threat Summary

| Threat ID | Category | Component  | Threat Description                   | Mitigation               | Risk Ref |
|-----------|----------|------------|---------------------------------------|--------------------------|----------|
| T-001     | S        | API Gateway| Token spoofing                        | Short TTL; SSO validation | R-001   |
| T-002     | T        | Database   | Unauthorized data modification        | RBAC; audit log           | R-001   |
| T-003     | I        | API        | PII exposed in logs or error responses| Structured logging policy | R-003   |

---

## Part 2 — OWASP Coverage

### OWASP Top 10 Mitigations

| OWASP Risk                          | Status | Risk Ref | Mitigation                                        |
|-------------------------------------|--------|----------|---------------------------------------------------|
| A01 Broken Access Control           | ⬜     | R-XXX    | <!-- RBAC, antiforgery on mutations -->           |
| A02 Cryptographic Failures          | ⬜     | R-XXX    | <!-- HTTPS, encrypted PII at rest -->             |
| A03 Injection                       | ⬜     | R-XXX    | <!-- ORM / parameterized queries, input validation --> |
| A04 Insecure Design                 | ⬜     | R-XXX    | <!-- Threat modeling, ASVS Level 2 design review --> |
| A05 Security Misconfiguration       | ⬜     | R-XXX    | <!-- Env separation, no dev creds in prod -->     |
| A06 Vulnerable Components           | ⬜     | R-XXX    | <!-- Pinned deps, automated CVE scanning -->      |
| A07 Auth & Session Failures         | ⬜     | R-XXX    | <!-- Auth framework; secure token handling -->    |
| A08 Software Integrity Failures     | ⬜     | R-XXX    | <!-- SBOM generation, signed releases -->         |
| A09 Logging & Monitoring Failures   | ⬜     | R-XXX    | <!-- Structured logging, alerting pipeline -->    |
| A10 SSRF                            | ⬜     | R-XXX    | <!-- Outbound request allowlisting -->            |

### OWASP ASVS Level 2 Status

| Chapter | Area                   | Status     |
|---------|------------------------|------------|
| V1      | Architecture           | ⬜ Pending |
| V2      | Authentication         | ⬜ Pending |
| V3      | Session Management     | ⬜ Pending |
| V4      | Access Control         | ⬜ Pending |
| V5      | Validation & Encoding  | ⬜ Pending |
| V6      | Cryptography           | ⬜ Pending |
| V7      | Error Handling/Logging | ⬜ Pending |
| V8      | Data Protection        | ⬜ Pending |
| V9      | Communication Security | ⬜ Pending |
| V10     | Malicious Code         | ⬜ Pending |
| V13     | API & Web Services     | ⬜ Pending |
| V14     | Configuration          | ⬜ Pending |

---

## Part 3 — SSDLC Compliance Overview

> Phase-gate rules → [`.github/rules/ssdlc.md`](.github/rules/ssdlc.md)

| Phase      | ISO 27001 Ref | Key Evidence                                       | Status     |
|------------|---------------|----------------------------------------------------|------------|
| Analysis   | 8.26          | `docs/features/`, §1.1 asset list, §1.2 risk register      | ⬜ Todo |
| Design     | 8.27          | `ARCHITECTURE.md`, §1.5 threat model, `adr/`               | ⬜ Todo |
| Development| 8.28, 8.31    | SAST, secret scanner, env separation enforced              | ⬜ Todo |
| Testing    | 8.29          | SAST/DAST passed, §Part 4 release checklist signed         | ⬜ Todo |
| Deployment | 8.31          | CI/CD only, approval logged, rollback plan ready           | ⬜ Todo |
| Maintenance| 8.25          | CVE monitoring, `MAINTENANCE.md` current                   | ⬜ Todo |

---

## Part 4 — Release Checklist

> Complete this checklist before every production deployment and link the completed checklist in the release PR.

### Pre-release

- [ ] All feature SSDLC gate checklists completed (§7 of each feature doc)
- [ ] §1.2 Risk Register reviewed — no unmitigated Critical/High risks
- [ ] §1.5 Threat Model current — updated for features in this release
- [ ] SAST passed — no unresolved critical or high findings
- [ ] DAST executed — all issues addressed or accepted with documented rationale
- [ ] Dependency audit clean (`<CVE scan command>` returns no critical/high findings)
- [ ] No PII or production credentials in test environments

### Deployment

- [ ] All changes deployed via CI/CD only; deployment approval documented
- [ ] Secrets managed in `<secret vault>` — none in code, config, or env files
- [ ] Rollback plan confirmed in `docs/operations/DEPLOYMENT.md`

### Post-release

- [ ] Post-deploy health check passed
- [ ] `CHANGELOG.md` updated with this release

| Date | Version | Released by | Notes |
|------|---------|-------------|-------|
| YYYY-MM-DD | | | |

---

## Change History

| Date       | Version | Author | Description                     |
|------------|---------|--------|---------------------------------|
| YYYY-MM-DD | 1.0     |        | Initial security declaration    |
