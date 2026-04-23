# debugging Reference

## 1. Reproduce
- Capture exact error message/stack trace
- Identify minimal reproduction steps
- Confirm deterministic failure (not flaky)
- If can't reproduce → gather logs/metrics, ask for more context, ∅guess
- Document: expected vs actual

## 2. Isolate
- When did it last work? (`git bisect` if unclear)
- Which component/layer/file?
- Fails in isolation or only in integration?
- Strip context until failure disappears → last removed = suspect
- Binary search: disable half the change, test, repeat

## 3. Hypothesize
- Generate ≥2 hypotheses (∅anchor on first guess)
- Rank by: probability · testability · blast-radius
- For each: what evidence confirms? what refutes?
- Check tasks/lessons.md for matching patterns

## 4. Verify
- Write a test that exposes the bug (TDD red step)
- Wrong hypothesis → eliminate → next hypothesis
- Right hypothesis → identify root cause (not just symptom)
- Root cause = the change/condition that, if fixed, prevents recurrence

## 5. Fix
- Addresses root cause, not surface symptom
- Test from step 4 now passes (green)
- ∀existing tests still pass (regression check)
- Minimal change: ∅opportunistic refactoring during bugfix
- Error paths explicit for the failure mode

## 6. Regression
- Test from step 4 is permanent (committed)
- Could this class of bug occur elsewhere?
- Pattern detected → add to tasks/lessons.md with trigger condition
- Gate should have caught it → strengthen gate in §4

