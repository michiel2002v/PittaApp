# security-audit Reference

## Phase 1: Surface Scan (automated, fast — SHORT-CIRCUIT on secrets)

### Secrets
- ∅hardcoded passwords, API keys, tokens, connection strings
- ∅PII in code, comments, or test fixtures
- Verify .gitignore covers: .env, *.key, *.pem, credentials.*, secrets.*

### Dependencies
- `dotnet list package --vulnerable` (backend)
- `pnpm audit` (frontend)
- ∅known CVEs in direct or transitive deps · ∅deprecated packages
- Licenses: MIT/Apache-2.0/BSD allowed · GPL/AGPL → legal review

### Static Analysis
- Security analyzers passing (0warn) · ∅suppressed warnings without justification · HTTPS-only

## Phase 2: Injection Review

| Surface | Check |
|---------|-------|
| SQL | ∀queries parameterized or EF-LINQ · ∅string concat · ∅raw SQL without params |
| Command | ∀shell invocations escaped · ∅user input to shell |
| XSS | ∀user content encoded on output · React: flag dangerouslySetInnerHTML · CSP configured |
| Deserialize | ∅BinaryFormatter · ∅untrusted deserialization · JSON schema validation |

## Phase 3: Auth/Authz

### Authentication
- Vintecc.Modules.Authentication applied at correct layer
- ∅bypass paths · session/token: secure, httponly, samesite
- ICurrentUser injected — ∅raw token claims in business logic

### Authorization
- ∅privilege escalation · resource-level checks · ∅IDOR · default-deny

### Input Validation
- ∀external input validated at boundary (type, range, length, format)
- antiforgery tokens on mutating endpoints

## Phase 4: Data Protection (GDPR)
- PII annotated ([PersonalData]) · retention policy defined per entity
- Audit trail on PII mutations · soft-delete for PII
- Encrypted at rest · ∅PII in logs
- Data export for user requests · consent at collection · DPIA for new processing

