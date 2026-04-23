# Feature: User Profile Management

> **NOTE: This is an example feature file showing how to fill in the template.**
> Delete this file and create `docs/features/001-YourFeatureName.md` for your first real feature.

---

## Feature Summary

| Field                  | Value                                                      |
|------------------------|------------------------------------------------------------|
| Feature ID             | `F-001`                                                    |
| Feature name           | User Profile Management                                    |
| Author / Owner         | `<name>`                                                   |
| Security Champion      | `<name>`                                                   |
| Status                 | **In Development**                                         |
| Sprint / Milestone     | Sprint 3                                                   |
| Risk Register refs     | `R-001, R-004` → [SECURITY.md §1.2](../../SECURITY.md#12-risk-register)    |
| Asset refs             | `A-001, A-002` → [SECURITY.md §1.1](../../SECURITY.md#11-asset-list)        |
| SSDLC Gate             | ✅ Analysis · ✅ Design · ⬜ Development · ⬜ Testing · ⬜ Deployment |

---

## 1. Feature Description

Authenticated users can view and update their own profile (display name, notification preferences). Required for GDPR data-subject access compliance.

### User Stories

```
As a logged-in user,
I want to view and update my profile,
so that I can keep my details current and manage notification preferences.
```

### Acceptance Criteria

- [ ] `Given a logged-in user, when they navigate to /profile, then they see their current details`
- [ ] `Given a logged-in user, when they submit an update, then only their own profile is changed`
- [ ] `Given an unauthenticated request, when /profile is called, then HTTP 401 is returned`
- [ ] Security: All endpoints require authentication
- [ ] Security: Users can only read/update their own profile (ownership check at service layer)
- [ ] Security: PII fields not logged; audit trail on every mutation
- [ ] Environment: Feature tested in `dev` and `test` before any production promotion

### Out of Scope

- Admin ability to edit other users' profiles (separate feature)
- Profile photo upload (separate feature)

---

## 2. Technical Impact

### Affected Components

| Component              | Change Type | Description of Change                                |
|------------------------|-------------|------------------------------------------------------|
| `ProfileService`       | New         | Service handling profile read/update logic           |
| `GET /api/v1/profile`  | New         | Returns authenticated user's own profile data        |
| `PUT /api/v1/profile`  | New         | Updates profile; antiforgery required                |
| `Users` table          | Modified    | Add `NotificationPreferences` column (JSON, nullable)|

### API Changes

```
GET /api/v1/profile  — returns own profile  | Auth: required | Role: any authenticated
PUT /api/v1/profile  — updates profile      | Auth: required | Antiforgery: required
```

### Data Model / Database Changes

- `Users` table: add column `NotificationPreferences <JSON column type> NULL`
- Migration: `<date>_AddNotificationPreferences`

### Third-Party Dependencies Introduced

| Package / Service | Version | Purpose | License | CVE check done? |
|-------------------|---------|---------|---------|-----------------|
| — (no new deps)   | —       | —       | —       | ✅              |

---

## 3. Security Impact

### 3.1 Data Classification

| Question                                              | Answer                          |
|-------------------------------------------------------|---------------------------------|
| What data does this feature handle?                   | Name, notification preferences  |
| Does it process personal data (PII)?                  | Yes                             |
| Data classification level                             | PII / Confidential              |
| GDPR Article 5 / 25 / 32 applicable?                  | Yes — data minimisation, privacy by design |
| Data retention period                                 | Per DPA — deleted on account closure |
| Business impact if this feature fails or is breached  | High                            |

### 3.2 Authentication & Authorization

| Question                                                    | Answer                                         |
|-------------------------------------------------------------|------------------------------------------------|
| Which roles/permissions are required?                       | Any authenticated user (own profile only)      |
| Are new roles or permissions being introduced?              | No                                             |
| Are there any anonymous / unauthenticated flows?            | No — 401 on all endpoints                      |
| Is elevation of privilege possible through this feature?    | No — ownership check enforced at service layer |
| Antiforgery tokens required on mutations?                   | Yes                                            |

### 3.3 OWASP Top 10 Relevance

| OWASP Risk                          | Relevant? | Mitigation for this feature                         |
|-------------------------------------|-----------|-----------------------------------------------------|
| A01 Broken Access Control           | ✅ Yes    | Ownership check enforced at service layer           |
| A02 Cryptographic Failures          | ✅ Yes    | PII encrypted at rest; HTTPS only                   |
| A03 Injection                       | ✅ Yes    | ORM parameterized queries; input validation on PUT  |
| A07 Auth & Session Failures         | ✅ Yes    | Auth required; no session changes via this feature  |
| A09 Logging & Monitoring Failures   | ✅ Yes    | Audit log on every mutation; no PII in logs         |

### 3.4 OWASP ASVS Level 2 Controls

| ASVS Chapter | Area                   | Applies? | Notes                                               |
|--------------|------------------------|----------|-----------------------------------------------------|
| V2           | Authentication         | ✅       | Auth required; 401 on unauthenticated               |
| V4           | Access Control         | ✅       | Ownership check; antiforgery on mutations           |
| V5           | Validation & Encoding  | ✅       | Input validation on all PUT fields                  |
| V7           | Error Handling/Logging | ✅       | Standard error responses; no PII in logs            |
| V8           | Data Protection        | ✅       | PII encrypted at rest; no PII in logs               |
| V13          | API & Web Services     | ✅       | OpenAPI spec; DTO validation                        |

---

## 4. Asset & Risk Register Changes

### 4.1 Asset Changes

| Change Type | Asset ID | Asset Name        | Classification | Justification                              |
|-------------|----------|-------------------|----------------|--------------------------------------------|
| Modified    | A-002    | Primary database  | PII            | New `NotificationPreferences` column added |

### 4.2 Risk Register Changes

| Change Type  | Risk ID | Threat / Vulnerability                       | Score  | Mitigation Added / Updated              |
|--------------|---------|----------------------------------------------|--------|------------------------------------------|
| Updated risk | R-001   | Unauthorized access — now covers profile data | 15 🔴 | Added ownership check at service layer  |

### 4.3 Threat Model Implications

- [x] New trust boundaries introduced? → No
- [x] New data flows introduced? → PUT /profile updates PII — added to SECURITY.md §1.5
- [x] STRIDE analysis updated for new flows?
- [x] New security requirements derived and added to `SECURITY.md`?

---

## 5. Environment Separation

| Item                  | Dev                                           | Test                                   |
|-----------------------|-----------------------------------------------|----------------------------------------|
| Branch                | `feature/001-user-profile`                    | `develop`                              |
| Data policy           | Synthetic users only — no real PII            | Anonymized dataset                     |
| Secrets source        | Local `.env` (gitignored)                     | CI/CD env variables                    |
| External integrations | Mocked                                        | Test-tier services only                |

### Production Promotion Criteria

- [ ] All acceptance criteria verified in `test`
- [ ] SSDLC checklist completed and signed off
- [ ] Security Champion sign-off
- [ ] SAST passed; DAST executed
- [ ] Dependency audit clean
- [ ] Rollback plan confirmed

---

## 6. Security Testing Plan

| Test Type        | Scope                                    | Required? |
|------------------|------------------------------------------|-----------|
| Unit tests       | Service ownership logic, validation      | Must      |
| Integration tests| GET/PUT /profile endpoints               | Must      |
| SAST             | Full delta on feature branch             | Must      |
| DAST             | /api/v1/profile endpoints                | Must      |
| Dependency audit | No new packages — baseline check         | Must      |

---

## 7. SSDLC Gate Checklist

### Gate 1 — Analysis ✅
- [x] Feature description written; data classification filled in
- [x] Asset and risk changes documented
- [x] Environment separation plan filled in
- [x] Security Champion sign-off: `<name>` / `<date>`

### Gate 2 — Design ✅
- [x] `ARCHITECTURE.md` updated
- [x] Threat model updated
- [x] OWASP ASVS review completed (§3.4)
- [x] Security Champion sign-off: `<name>` / `<date>`

### Gate 3 — Development ⬜
- [ ] No hard-coded credentials
- [ ] No raw query concatenation
- [ ] Env separation enforced
- [ ] OWASP mitigations from §3.3 implemented
- [ ] Secret scanner passing

### Gate 4 — Testing ⬜
- [ ] All tests from §6 passing
- [ ] SAST clean; DAST executed
- [ ] `SECURITY.md` Part 4 release checklist completed

### Gate 5 — Deployment ⬜
- [ ] Production promotion criteria passed
- [ ] CI/CD deployment; approval documented
- [ ] Post-deploy health check passed

---

## 8. Dependencies & References

- Risk Register: [SECURITY.md §1.2](../../SECURITY.md#12-risk-register)
- Asset List: [SECURITY.md §1.1](../../SECURITY.md#11-asset-list)
- Architecture: `docs/architecture/ARCHITECTURE.md`
- Threat model: [SECURITY.md §1.5](../../SECURITY.md#15-threat-model)
