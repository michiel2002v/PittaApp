---
name: dependency-audit
description: Audits all dependencies for vulnerabilities, freshness, license compliance, and floating versions. Use when adding a new dependency, on the monthly ≤30d cycle, before a release, or when a security alert arrives.
---
trig: §4b.Dep·update-cycle≤30d·new-dependency·pre-release·security-alert
in: project-manifest(Directory.Packages.props|*.csproj|package.json|pnpm-lock.yaml)

## Steps
1. **inventory** — list direct + transitive deps · flag floating versions
2. **vulnerability-scan** — `dotnet list package --vulnerable` · `pnpm audit` · triage each finding
3. **freshness** — >30d behind → schedule · >90d → urgent · deprecated → plan replacement
4. **license-check** — allow-list: MIT/Apache-2.0/BSD/ISC/0BSD · GPL/AGPL → legal review · flag unknown
5. **evaluate-update** — one dep at a time · run full tests after each · read changelog for breaking changes
6. **report** — update kb/quality-baselines.md · log in tasklog · ADR for dep replacements

## Rules
- pin-major: ∅floating versions · one update per commit
- ∅new dep without justification · ∅transitive-vuln counts
- update-cycle ≤ 30d — monthly minimum

## Verify
- audit returns 0 vulns (or all documented exceptions)
- ∅floating versions · ∅deprecated packages without plan
- all licenses on allow-list or documented

## Fail
- critical CVE → patch immediately → hotfix workflow if in production
- license violation → remove dep → find alternative → ADR

