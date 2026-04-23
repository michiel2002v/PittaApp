# code-review Reference

## Phase 1: Automated Gates (short-circuit on fail)

### Val — lint/format
- .editorconfig compliance verified · `dotnet format --verify-no-changes`
- ∅suppress directives added · ∅ignore-directive added

### Cor — build
- clean compile, no new warnings · all existing tests still pass

### Tst — test suite
- ∀new behavior has test · cov:∆≥80% · crit-path=100%
- AAA structure · 1assert-per-act · test-commit < impl-commit in log

## Phase 2: Hostile Review

### Sec
- ∅secrets/PII in diff · injection: SQL/shell/HTML/template/deserialization
- auth: correct layer? bypass possible? · ∅new CVE · antiforgery on mutations · HTTPS-only

### Cor.falsify
- null/empty/bounds? · concurrent access/races? · error paths: ∀explicit + ∀tested
- timeout/network failure/disk full? · 3 failure scenarios enumerated and addressed

### Typ
- ∅any/unsafe without justification · pub return types explicit
- nullability at boundaries · DTO≠domain≠value objects

## Phase 3: Design Review

### Abs
- generalize? reuse? → extract · ∅one-offs · DRY · interface@boundary · ∅leaky abstractions

### Mnt
- clear deps · low coupling · high cohesion · SRP · ∅circular refs
- names reveal intent · ∅God-class (>300LOC → split)

### Perf
- ∅O(n²) without ADR · ∅N+1 · ∅unbounded queries · async-all-the-way

## Phase 4: Process Review
- **Doc**: ∀pub→xml-doc · ∀non-trivial→comment(what+why) · ∅stale docs
- **Git**: §3fmt · 1unit per commit · ∅drift
- **GDPR**: PII annotated · retention defined · ∅PII in logs
- **API**: ∅breaking without ADR+deprecation · contract-test@boundary
- **Dep**: ∅floating versions · ∅deprecated packages · licenses checked

## Phase 5: Pre-Merge
`git log #{N}` → sequential? 1c/unit? ∅gaps? trail tells story? test<impl throughout? plan commit first?

