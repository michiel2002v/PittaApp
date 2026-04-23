# SSDLC Rules — Secure Development Policy (ISO 27001)
# Source of truth for all agent gate enforcement. All rules are mandatory.
# Gate IDs: ANA · DES · DEV · TST · DEP · MNT

---

## §SSDLC Phase Gates

### [ANA] Analysis Gate — before any feature work starts

MUST: `SECURITY.md` §1.1 (Asset List) reflects current assets
MUST: `SECURITY.md` §1.2 (Risk Register) contains an up-to-date risk analysis
MUST: Data sensitivity and classification documented in the risk register
MUST: PII analysis performed — feature file §3.1 explicitly answers: (1) is PII processed? (2) which fields? (3) legal basis? (4) retention period?
MUST: Legal, regulatory, and contractual obligations listed (GDPR, ISO 27001)
MUST: Feature file exists at `docs/features/xxx-FeatureName.md`
MUST: Feature file §3 (Security Impact) and §4 (Asset & Risk Changes) completed
MUST: Feature file §5 (Environment Separation Requirements) completed
MUST: `SECURITY.md` §1 updated to reflect any new assets or risks

FAIL[ANA-1]: feature work started without a matching `docs/features/xxx-*.md` → BLOCK
FAIL[ANA-2]: feature work started without a risk register entry → BLOCK
FAIL[ANA-3]: feature file §3.1 PII analysis left blank → BLOCK

---

### [DES] Design Gate — before implementation begins

MUST: `SECURITY.md` §1.5 (Threat Model) updated for the new feature/component
MUST: `docs/architecture/ARCHITECTURE.md` references mitigations from `SECURITY.md` §1.2
MUST: Architecture addresses all OWASP ASVS Level 2 controls relevant to feature scope
MUST: Secure design areas documented — auth/authz · input validation · data flow control · output protection · interfaces · logging · restart/recovery · cryptography
MUST: ADR created in `docs/architecture/adr/` for every significant design decision
MUST: Design reviewed by Security Champion or peer before coding starts

---

### [DEV] Development Gate — enforced by §4.Sec + @agt:security-reviewer on every code-∆

BLOCK: hard-coded credentials detected
BLOCK: raw SQL without parameterization detected
MUST: env separation enforced — dev ≠ test ≠ prod (branch protections + access controls)
MUST: branch protections active — no direct commits to `main`
MUST: error handling explicit; no silent catch (log or rethrow)
MUST: OWASP Top 10 defenses applied — reviewed by @agt:security-reviewer
MUST: SAST scan passes in CI/CD pipeline
MUST: secret scanner passes before any commit (CI gate)
MUST: `CHANGELOG.md` updated for every change

---

### [TST] Testing Gate — before any release or deployment

MUST: security testing suite complete — unit · integration · SAST · DAST · SBOM
MUST: OWASP ASVS Level 2 used as test basis for application security controls
MUST: test data anonymized — no production PII in test environments
MUST: `SECURITY.md` Part 4 (Release Checklist) completed and signed
MUST: critical-path security controls at 100% test coverage
RECOMMEND: penetration test for significant releases or components with Risk Score ≥ 15

---

### [DEP] Deployment Gate — before merge to production

MUST: deployment via automated CI/CD pipeline only; approval documented
MUST: rollback strategy documented in `docs/operations/DEPLOYMENT.md`
MUST: secrets managed via `<secret vault>` — never in code or env files
MUST: environment separation validated post-deploy
MUST: all deployment actions logged for traceability

---

### [MNT] Maintenance Gate — ongoing

MUST: patch management active — all components monitored for CVEs
MUST: `docs/operations/MAINTENANCE.md` reviewed and updated each sprint/release
MUST: vulnerability scanning automated in pipeline with alerts
MUST: lessons learned from incidents fed back into `SECURITY.md` §1.2 and Part 4

---

## §Feature File Convention

Pattern: `docs/features/NNN-FeatureName.md`
- `NNN` = zero-padded 3-digit sequence number (001, 042, 123)
- `FeatureName` = PascalCase
- Template: `docs/features/FEATURE_TEMPLATE.md`

Required sections (all mandatory):
1. §1 Feature Description — user stories + acceptance criteria
2. §2 Technical Impact — components · API · DB · infra · dependencies
3. §3 Security Impact — PII/data classification · auth/authz · OWASP Top 10 · ASVS Level 2
4. §4 Asset & Risk Register Changes — delta to `SECURITY.md` §1.1 and §1.2
5. §5 Environment Separation — dev / test / prod plan (ISO 8.31)
6. §6 Security Testing Plan — per-feature test requirements
7. §7 SSDLC Gate Checklist — one checklist per phase, signed in sequence

FAIL: feature branch opened without `docs/features/xxx-*.md` → BLOCK

---

## §SSDLC Doc Artifacts

Artifacts required before a feature is considered complete:

| Artifact | Phase | Required |
|---|---|---|
| `SECURITY.md` §1 (asset list · risk register · threat model) | Analysis + Design | MUST |
| `docs/features/NNN-FeatureName.md` | Analysis | MUST per feature |
| `docs/architecture/ARCHITECTURE.md` | Design | MUST |
| `docs/architecture/adr/ADR_*.md` | Design | MUST per decision |
| `SECURITY.md` Part 4 release checklist (signed) | Testing | MUST |
| `docs/operations/DEPLOYMENT.md` | Deployment | MUST |
| `docs/operations/MAINTENANCE.md` | Maintenance | MUST |

---

## §Team Responsibilities

- Security Champion — drives gate compliance; reviews threat models
- Project Lead — ensures docs complete before each gate
- Developers — adhere to secure coding standards; complete gate checklists
- @agt:security-reviewer — enforces security gates on every code-∆ (mandatory, not optional)

---

## §Boot Check

On §1a boot, agent MUST verify:
- `SECURITY.md` present → WARN if missing
- `AGENTS.md` present → WARN if missing

On feature task assignment, agent MUST additionally verify:
- `docs/features/xxx-FeatureName.md` exists → WARN + BLOCK if missing
- `SECURITY.md` §1.2 current and consistent with feature files
- Feature file §5 (Environment Separation) completed

Surface all missing-artifact warnings to the user before proceeding.
