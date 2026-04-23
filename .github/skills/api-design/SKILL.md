---
name: api-design
description: Contract-first API design — OpenAPI spec and contract tests before any implementation code. Use when creating a new API, adding a new endpoint, redesigning an existing API, or when §4b.API gate applies.
---
trig: new-api·new-endpoint·api-redesign·§4b.API
in: requirements·consumer-needs·domain-model

See [REFERENCE.md](REFERENCE.md) for full step-by-step procedure and rules.

## Steps (summary)
1. **contract-first** — identify consumers, write OpenAPI spec BEFORE code, version in route (/v1/)
2. **model** — DTOs at boundary, ProblemDetails for errors, ∅over-fetching, pagination for collections
3. **safety** — auth on all endpoints, rate-limit public, idempotency-key on mutations, input validation
4. **contract-tests** — write BEFORE implementation: request validation, response shape, auth, pagination
5. **implement** — build to pass contract tests; map DTO↔domain at boundary; delegate to Vintecc.Mediator
6. **document** — OpenAPI complete, README, breaking change policy, deprecation cycle

## Rules
- ∅breaking changes without ADR + deprecation cycle
- OpenAPI = source of truth (∅spec drift from implementation)
- ∅new endpoint without contract test
- pagination mandatory for collection endpoints

## Fail
- spec and impl diverge → fix impl to match spec
- breaking change unavoidable → ADR + version bump + deprecation cycle

