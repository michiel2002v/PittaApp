# Feature Template

> **Naming convention:** `docs/features/xxx-FeatureName.md`
> Copy this template, rename it, and fill it in during the Analysis phase.
> This file is mandatory SSDLC evidence (ISO 27001: 8.26).

---

# Feature: \<Feature Name\>

> SSDLC Phase: Analysis → Design → Development
> Feature ID: `F-XXX` | File: `docs/features/xxx-FeatureName.md`

---

## Feature Summary

| Field                  | Value                                                      |
|------------------------|------------------------------------------------------------|
| Feature ID             | `F-XXX`                                                    |
| Feature name           | `<name>`                                                   |
| File                   | `docs/features/xxx-FeatureName.md`                         |
| Author / Owner         | `<name>`                                                   |
| Security Champion      | `<name>`                                                   |
| Status                 | Draft / In Review / Approved / In Development / Done       |
| Sprint / Milestone     | `<sprint>`                                                 |
| Risk Register refs     | `R-XXX, R-YYY` → [SECURITY.md §1.2 Risk Register](../../SECURITY.md#12-risk-register) |
| Asset refs             | `A-XXX, A-YYY` → [SECURITY.md §1.1 Asset List](../../SECURITY.md#11-asset-list) |
| SSDLC Gate             | ⬜ Analysis · ⬜ Design · ⬜ Development · ⬜ Testing · ⬜ Deployment |

---

## 1. Feature Description

<!-- What does it do? Who uses it? Why is it needed? What is the business value? -->

### User Stories

```
As a <role>,
I want to <goal>,
so that <benefit>.
```

```
As a <role>,
I want to <goal>,
so that <benefit>.
```

### Acceptance Criteria

- [ ] `Given <context>, when <action>, then <outcome>`
- [ ] `Given <context>, when <action>, then <outcome>`
- [ ] Security: All endpoints require authentication
- [ ] Security: Input validated at API boundary
- [ ] Security: PII not logged; audit trail on mutations
- [ ] Security: SSDLC checklist completed before release
- [ ] Environment: Feature tested in `dev` and `test` before any production promotion

### Out of Scope

<!-- Explicitly list what is NOT part of this feature to prevent scope creep -->

---

## 2. Technical Impact

### Affected Components

| Component          | Change Type              | Description of Change                 |
|--------------------|--------------------------|---------------------------------------|
| `<service/module>` | New / Modified / Removed | <!-- what changes -->                 |
| `<API endpoint>`   | New / Modified / Removed |                                       |
| `<database table>` | New / Modified / Removed |                                       |
| `<UI component>`   | New / Modified / Removed |                                       |
| `<external dep.>`  | New / Upgraded / Removed |                                       |

### API Changes

<!-- List new/changed endpoints with auth requirements -->

### Data Model / Database Changes

<!-- Describe schema changes, new tables, migrations needed -->

### Infrastructure / Configuration Changes

<!-- New env variables, Key Vault secrets, queue topics, storage containers, etc. -->

### Third-Party Dependencies Introduced

| Package / Service | Version | Purpose | License | CVE check done? |
|-------------------|---------|---------|---------|-----------------|
|                   |         |         |         | ⬜              |

---

## 3. Security Impact

> **Mandatory.** Complete and review with the Security Champion before the Design Gate.

### 3.1 Data Classification

| Question                                              | Answer                                             |
|-------------------------------------------------------|----------------------------------------------------|
| What data does this feature handle?                   | <!-- describe -->                                  |
| Does it process personal data (PII)?                  | Yes / No                                           |
| Data classification level                             | Public / Internal / Confidential / PII             |
| GDPR Article 5 / 25 / 32 applicable?                  | Yes / No / N/A                                     |
| Data retention period                                 | <!-- e.g. 7 years, or per DPA -->                  |
| Business impact if this feature fails or is breached  | Critical / High / Medium / Low                     |
| Legal / regulatory obligations that apply             | GDPR / ISO 27001 / Contractual / Other / None      |

### 3.2 Authentication & Authorization

| Question                                              | Answer                                             |
|-------------------------------------------------------|----------------------------------------------------|
| Which roles/permissions are required?                 | <!-- list roles -->                                |
| Are new roles or permissions being introduced?        | Yes / No → if Yes, describe                        |
| Are there any anonymous / unauthenticated flows?      | Yes / No → if Yes, justify                         |
| Is elevation of privilege possible through this feature? | Yes / No → if Yes, mitigate                    |
| Antiforgery tokens required on mutations?             | Yes / N/A                                          |

### 3.3 OWASP Top 10 Relevance

Mark which OWASP Top 10 risks are relevant to this feature and document the mitigation.

| OWASP Risk                          | Relevant? | Mitigation for this feature                        |
|-------------------------------------|-----------|----------------------------------------------------|
| A01 Broken Access Control           | ⬜ Yes / ⬜ No | <!-- how RBAC is applied -->                   |
| A02 Cryptographic Failures          | ⬜ Yes / ⬜ No | <!-- encryption at rest/transit -->            |
| A03 Injection                       | ⬜ Yes / ⬜ No | <!-- ORM / parameterized queries, input validation --> |
| A04 Insecure Design                 | ⬜ Yes / ⬜ No | <!-- threat model covers this -->              |
| A05 Security Misconfiguration       | ⬜ Yes / ⬜ No | <!-- env separation, no defaults exposed -->   |
| A06 Vulnerable Components           | ⬜ Yes / ⬜ No | <!-- new deps audited, pinned -->              |
| A07 Auth & Session Failures         | ⬜ Yes / ⬜ No | <!-- SSO, session TTL -->                      |
| A08 Software Integrity Failures     | ⬜ Yes / ⬜ No | <!-- SBOM, signed artifacts -->                |
| A09 Logging & Monitoring Failures   | ⬜ Yes / ⬜ No | <!-- structured logging, no PII -->            |
| A10 SSRF                            | ⬜ Yes / ⬜ No | <!-- outbound requests allowlisted -->         |

### 3.4 OWASP ASVS Level 2 Controls Applicable to This Feature

Mark which ASVS chapters apply and note the implementation approach.

| ASVS Chapter | Area                   | Applies? | Implementation / Notes                      |
|--------------|------------------------|----------|---------------------------------------------|
| V2           | Authentication         | ⬜       |                                             |
| V3           | Session Management     | ⬜       |                                             |
| V4           | Access Control         | ⬜       |                                             |
| V5           | Validation & Encoding  | ⬜       |                                             |
| V6           | Cryptography           | ⬜       |                                             |
| V7           | Error Handling/Logging | ⬜       |                                             |
| V8           | Data Protection        | ⬜       |                                             |
| V11          | Business Logic         | ⬜       |                                             |
| V12          | Files & Resources      | ⬜       |                                             |
| V13          | API & Web Services     | ⬜       |                                             |

---

## 4. Asset & Risk Register Changes

> Update SECURITY.md §1.1 and §1.2 before proceeding to Design; record the delta here.
> A feature must not proceed to Design until this section is reviewed.

### 4.1 Asset Changes

| Change Type    | Asset ID | Asset Name            | Classification       | Justification                        |
|----------------|----------|-----------------------|----------------------|--------------------------------------|
| New            | A-XXX    | `<asset name>`        | Internal/Confidential/PII | <!-- why this asset is added --> |
| Modified       | A-XXX    | `<existing asset>`    | — (unchanged)        | <!-- what changed about it -->       |
| No change      | —        | —                     | —                    |                                      |

### 4.2 Risk Register Changes

| Change Type    | Risk ID | Threat / Vulnerability            | Score    | Mitigation Added / Updated          |
|----------------|---------|-----------------------------------|----------|--------------------------------------|
| New risk       | R-XXX   | `<describe threat>`               | <!-- --> | <!-- mitigation planned -->          |
| Updated risk   | R-XXX   | `<existing risk — changed scope>` | <!-- --> | <!-- updated mitigation -->          |
| Mitigated      | R-XXX   | `<risk now fully mitigated>`      | Low      | <!-- how it was closed -->           |
| No change      | —       | —                                 | —        |                                      |

### 4.3 Threat Model Implications

> Threat model → [SECURITY.md §1.5 Threat Model](../../SECURITY.md#15-threat-model)

- [ ] New trust boundaries introduced? → describe:
- [ ] New data flows introduced? → describe:
- [ ] STRIDE analysis updated for new flows?
- [ ] New security requirements derived and added to `SECURITY.md`?

---

## 5. Environment Separation Requirements

> ISO 27001:2022 – 8.31 | Mandatory before any code is written.

### 5.1 Dev Environment

| Item                                | Detail                                           |
|-------------------------------------|--------------------------------------------------|
| Branch                              | `feature/xxx-feature-name`                       |
| Data policy                         | Synthetic / anonymized data only — **no PII**    |
| Secrets source                      | Local `.env` (gitignored) / dev Key Vault        |
| External integrations               | Mocked / sandboxed — no production endpoints     |
| Feature flags                       | Feature disabled in prod until explicitly enabled |
| Who has access                      | Developers only                                  |

### 5.2 Test Environment

| Item                                | Detail                                           |
|-------------------------------------|--------------------------------------------------|
| Branch                              | `develop` / `test`                               |
| Data policy                         | Anonymized test dataset — no production PII      |
| Secrets source                      | CI/CD environment variables / test Key Vault     |
| Integration testing                 | Test-tier external services only                 |
| Security testing required           | SAST ✅ · DAST ✅ · Dependency audit ✅           |

### 5.3 Production Promotion Criteria

The following gates must all pass before this feature is deployed to production:

- [ ] All acceptance criteria verified in `test` environment
- [ ] SSDLC release checklist (`SECURITY.md` Part 4) completed and signed off
- [ ] Security Champion sign-off on security impact assessment (§3 above)
- [ ] SAST scan passed — no unresolved critical/high findings
- [ ] DAST scan executed and findings addressed
- [ ] Dependency audit clean
- [ ] No production secrets or PII used in dev/test
- [ ] Deployment approval documented in CI/CD pipeline
- [ ] Rollback plan confirmed in `docs/operations/DEPLOYMENT.md`

---

## 6. Security Testing Plan

| Test Type          | Scope for this feature                              | Tool / Method           | Required? |
|--------------------|-----------------------------------------------------|-------------------------|-----------|
| Unit tests         | All business logic, validation, auth checks         | `<test framework>`      | Must      |
| Integration tests  | API endpoints, DB interactions, auth flows          | `<integration test framework>` | Must |
| SAST               | Full codebase delta                                 | CI-integrated scanner   | Must      |
| Secret scanning    | All commits in this feature branch                  | CI push protection      | Must      |
| Dependency audit   | All new/updated packages                            | `<CVE scan tool>`       | Must      |
| DAST               | New API endpoints                                   | Pre-release scan        | Must      |
| OWASP ASVS review  | Chapters marked in §3.4                             | Manual checklist        | Must      |
| Penetration test   | Only if Risk Score ≥ 15 (Critical) for any new risk | External / internal     | If applicable |

---

## 7. SSDLC Gate Checklist

### Gate 1 — Analysis ✅ / ⚠️ / ❌
- [ ] Feature description written (this document)
- [ ] Business requirements defined (§1)
- [ ] Data classification filled in (§3.1)
- [ ] Asset changes documented (§4.1) and SECURITY.md §1.1 updated
- [ ] Risk changes documented (§4.2) and SECURITY.md §1.2 updated
- [ ] Environment separation plan filled in (§5)
- [ ] Feature reviewed by Security Champion → **Sign-off: `<name>` / `<date>`**

### Gate 2 — Design ✅ / ⚠️ / ❌
- [ ] `docs/architecture/ARCHITECTURE.md` updated for this feature
- [ ] Threat model updated (`SECURITY.md` §1.5) — §4.3 complete
- [ ] OWASP ASVS Level 2 design review completed (§3.4)
- [ ] ADR created for any significant design decision (`docs/architecture/adr/ADR_XXX.md`)
- [ ] Security requirements derived and added to `SECURITY.md`
- [ ] Design reviewed by Security Champion or peer → **Sign-off: `<name>` / `<date>`**

### Gate 3 — Development ✅ / ⚠️ / ❌
- [ ] No hard-coded credentials
- [ ] No raw queries hard-coded (use parameterized queries / ORM)
- [ ] Env separation enforced: dev config ≠ prod config
- [ ] OWASP Top 10 mitigations from §3.3 implemented
- [ ] Branch protections active; no direct commits to `main`
- [ ] Error handling explicit; `ProblemDetails` in API; no silent catch
- [ ] Structured logging; no PII in logs
- [ ] Secret scanner passing on all commits

### Gate 4 — Testing ✅ / ⚠️ / ❌
- [ ] All tests from §6 executed and passing
- [ ] SAST clean (no unresolved critical/high)
- [ ] DAST executed; findings addressed
- [ ] OWASP ASVS Level 2 test cases executed for this feature's scope
- [ ] Test data anonymized; no PII or production data used
- [ ] `SECURITY.md` Part 4 release checklist completed for this release

### Gate 5 — Deployment ✅ / ⚠️ / ❌
- [ ] Production promotion criteria from §5.3 all passed
- [ ] Deployment via CI/CD pipeline only (no manual deploys)
- [ ] Approval documented: `<approver>` / `<date>`
- [ ] Secrets in `<secret vault>`; none in code or env files
- [ ] Post-deploy health check passed
- [ ] Rollback strategy confirmed

---

## 8. Dependencies & References

| Dependency                        | Type         | Risk  | Notes                            |
|-----------------------------------|--------------|-------|----------------------------------|
|                                   |              |       |                                  |

- Risk Register: [SECURITY.md §1.2](../../SECURITY.md#12-risk-register) — R-XXX, R-YYY
- Asset List: [SECURITY.md §1.1](../../SECURITY.md#11-asset-list) — A-XXX
- Architecture: `docs/architecture/ARCHITECTURE.md`
- Threat model: [SECURITY.md §1.5](../../SECURITY.md#15-threat-model)
- OWASP coverage: [SECURITY.md Part 2](../../SECURITY.md#part-2--owasp-coverage)
- Release checklist: [SECURITY.md Part 4](../../SECURITY.md#part-4--release-checklist)
- SSDLC rules: `.github/rules/ssdlc.md`
- Secure Development Policy: `docs/policies_and_procedures/Secure Development Policy.pdf`

---

## Change History

| Date       | Version | Author | Description                    |
|------------|---------|--------|--------------------------------|
| YYYY-MM-DD | 1.0     |        | Initial feature analysis draft |
