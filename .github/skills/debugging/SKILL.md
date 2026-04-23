---
name: debugging
description: Evidence-first root-cause debugging — reproduce, isolate, form ≥2 hypotheses, verify, fix, regress. Use when a test fails, a bug is reported, or unexpected behavior occurs.
---
trig: §5.F·test-failure·unexpected-behavior·bug-report·error-in-output
in: symptom·error-message·reproduction-steps·expected-vs-actual

See [REFERENCE.md](REFERENCE.md) for full step-by-step procedure.

## Steps (summary)
1. **reproduce** — capture exact error, confirm deterministic failure
2. **isolate** — which component/layer? git bisect if unclear
3. **hypothesize** — ≥2 hypotheses, ranked by probability·testability·blast-radius
4. **verify** — write failing test (TDD red), confirm/eliminate hypothesis
5. **fix** — minimal change addressing root cause, ∅patch symptoms
6. **regression** — keep test permanently, log lesson if pattern

## Rules
- evidence before theory · root cause before fix · ≥2 hypotheses
- test before fix · time-box: 5 cycles max → escalate

## Fail
- can't reproduce → gather more context, ∅guess-fix
- all hypotheses eliminated → widen scope, escalate
- fix breaks other tests → revert, re-isolate

