---
name: security-audit
description: Runs all four security audit phases — secrets scan, dependency CVEs, injection review, auth/authz, and GDPR. Use when adding a new endpoint, changing auth, adding external input, updating dependencies, or before any release.
---
trig: §4a.Sec·new-endpoint·auth-change·external-input·dependency-update·pre-release
in: target-scope(files|endpoints|components)·threat-model(if exists)

See [REFERENCE.md](REFERENCE.md) for full phase checklists.

## Phase Summary
1. **surface-scan** (automated) — secrets, dep CVEs, static analysis. Short-circuits: ∅proceed if secrets found.
2. **injection-review** — SQL, command, XSS/template, deserialization
3. **auth/authz** — authentication layer, authorization (resource-level), input validation, antiforgery
4. **data-protection** — PII annotation, retention, audit trail, soft-delete, encryption, ∅PII in logs

## Rules
- phase-1 short-circuits: secrets found → BLOCK all · ∅proceed to phase-2
- every finding = fix or documented exception with justification
- audit:0warn before commit

## Verify
- ∀phases completed · ∅open findings without fix or exception
- automated scans pass (0warn) · auth boundaries verified

## Fail
- secret found → remove from history → rotate credential → incident report
- CVE found → assess severity → patch or ADR if can't patch
- auth bypass → block commit → fix before proceeding

