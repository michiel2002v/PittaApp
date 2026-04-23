---
name: workflow-config
description: Config-only change flow — update config files safely with secrets scan. Use when only appsettings, environment variables, or metadata files need changing (no source code).
---
trig: config-only-change·appsettings·env-vars·§2.config
in: config-scope·changed-files

## Sequence
1. **identify** — which config? appsettings.json / appsettings.Development.json / .env / launchSettings.json
   - ∅secrets in config files — use user-secrets or env vars
2. **change** — update config · ∅hardcoded secrets · use Options pattern · document new keys
3. **review** — @agt:reviewer (1 cycle · §4b + Sec.secrets-scan)

## Gates
- ∅secrets in committed config
- ∅runtime-breaking change without test
- Sec secrets-scan passes

## Abort
- config requires code change → standard workflow
- secrets detected → BLOCK → rotate → fix → re-submit

