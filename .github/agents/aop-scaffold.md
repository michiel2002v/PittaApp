# AOP-SCAFFOLD
Bootstrap instruction set. Execute §S1→§S6 to initialize AOP project infrastructure.
Ref: aop-optimised.md (runtime protocol). This file: execute-once setup + skill/agent/KB content reference.
SYM:→seq ·and |or ∅no @ctx ()detail ∧req ∀every ≥min ≤max ∆change ↑up #ref ∥parallel

## §S1 !structure
```
.github/
  rules/
  skills/
    commit-workflow.md        — §3 commit sequence
    tdd-workflow.md           — §2+§4 test-first cycle
    kb-templates.md           — §6 entry/ADR/playbook formats
    domain-dotnet.md          — §4a .NET gate overlay
    domain-template.md        — blank overlay for new languages
    workflow-feature.md       — end-to-end feature delivery
    workflow-hotfix.md        — production bugfix flow
    workflow-migration.md     — DB migration procedure
    code-review.md            — §5 pre-c + pre-mrg hostile review
    debugging.md              — §5.F root-cause analysis
    context-handoff.md        — §5 ctx thresholds + session boundary
    refactoring.md            — pure refactor without new behavior
    security-audit.md         — §4a.Sec full audit procedure
    api-design.md             — contract-first API creation
    pr-creation.md            — PR assembly and submission
    release.md                — version, deploy, rollback
    dependency-audit.md       — §4b.Dep monthly audit cycle
    kb-prune.md               — §6 knowledge base maintenance
    retrospective.md          — §1b.evolve pattern promotion
    engine-claude.md          — §7e Claude model delegation (sonnet/haiku)
    engine-codex.md           — §7e Codex CLI invocation wrapper
    engine-gemini.md          — §7e Gemini CLI invocation wrapper
    engine-dispatch.md        — §7e model selection + orchestration
    engine-review-synthesis.md — §7e multi-model review merger
    task-triage.md            — §2 task classification before planner
    workflow-bootstrap.md     — greenfield project initialization
    workflow-docs.md          — documentation-only changes (fast-track)
    workflow-config.md        — config/metadata-only changes (fast-track)
    workflow-merge.md         — merge/rebase/conflict resolution
    workflow-external-review.md — external PR review
  agents/
    planner.agent.md              — §7a task decomposition + planning (RO)
    critic.agent.md               — §7a adversarial analysis, 3 failures (RO)
    reviewer.agent.md             — §7a code quality verification (read+test)
    implementer.agent.md          — §7a TDD code writer (write:src,test,cfg)
    security-reviewer.agent.md    — §7a security audit execution (read+shell)
    debugger.agent.md             — §7a root-cause analysis (read+test+limited-write)
    refactorer.agent.md           — §7a pure structural improvement (write:src,test)
    api-architect.agent.md        — §7a contract-first API design (RO→write:spec,test)
    release-coordinator.agent.md  — §7a release management (read+shell+write:docs,tags)
    kb-curator.agent.md           — §7a KB maintenance + retrospective (write:kb,tasks)
    engine-dispatcher.agent.md    — §7e external engine orchestration (read+shell)
    infra-ops.agent.md            — §7a CI/CD + infrastructure (write:ci,deploy,infra)
    agent-log.agent.md            — §6a inter-agent communication channel
  settings.json
tasks/
  todo.md
  tasklog.md
  lessons.md
  handoff.md
  exploration.md              — cross-session: reasoning chains, rejected alternatives
kb/
  index.md
  memory-map.md
  agent-registry.md
  quality-baselines.md
  decision-rationale.md      — cross-session: significant decisions with alternatives
  engine-metrics.md          — cross-engine: rolling 30-day performance per model
  engine-quality-map.md      — cross-engine: per engine+task gate pass/fail
  engine-finding-attribution.md — cross-engine: which engines detect which findings
  engine-dispatch-log.md     — cross-engine: dispatch outcomes and fallback analysis
  code-provenance.md         — cross-engine: commit-to-engine mapping
  cost-tracking.md           — cross-engine: monthly spend and budget
  entry-changelog.md         — cross-session: KB entry status change audit trail
  anti-patterns.md           — cross-session: failed approaches catalogued
  abandonment-log.md         — cross-session: mandatory post-mortem per abandoned task
  critic-reviewer-sync.md    — cross-agent: prediction validation
  root-cause-map.md          — cross-agent: debugging findings by root cause
  hypothesis-journal.md      — cross-agent: all hypotheses evaluated in debugging
  code-smells-by-module.md   — cross-agent: recurring smells per module
  domains/
  decisions/
  playbooks/
AGENT.md
.editorconfig
.mcp.json (if MCP needed)
```
Create all dirs·touch all files·∅overwrite existing.

## §S2 !skills — write each to .github/skills/{name}.md

---

### commit-workflow.md
```
trig: §3.seq·new-branch·first-commit
in: #{N}·task-scope
steps:
  1. `#{N}.1.plan:summary` — plan commit. Write todo.md+approach. ∅code.
  2. `#{N}.2.test:summary` — test commit(red). ∀test must fail. Proves spec before impl.
  3. `#{N}.{s}.feat:summary` — impl commit(green). ∀test must pass. Minimal to satisfy.
  4. `#{N}.{s}.refactor:summary` — refactor commit. ∀test still pass. Optional per cycle.
  5. `#{N}.$.docs:summary` — docs commit. Final. CHANGELOG+README+xml-doc.
  rev: `#{N}.{s}.revert:{prev}.reason` — revert commit. Reason in body.
rules:
  - test-commit(2) < impl-commit(3) — enforced ordering
  - 1c=1unit — each commit is one logical unit
  - ∅bundle — never combine unrelated changes
  - fail∈body — failure details go in commit body
  - ∅impl-before-test — invariant from §I
ver: `git log #{N}` → seq?ordered?test<impl?∅gap?trail=story?
fail:
  - violate ordering → revert → split
  - revert.depth≤2 → deeper → abandon+handoff
  - ∅gap in sequence → halt → fill missing commit
```

---

### tdd-workflow.md
```
trig: ∀feat·∀fix·∀impl·§4.Tst
in: requirement|bug-report|spec
steps:
  1. test-design — write test expressing desired behavior
     - name: `Method_Scenario_Expected`
     - AAA: arrange/act/assert
     - 1assert-per-act
     - ∅logic-in-test → extract to helper
  2. red — run test → must fail
     - failure proves spec not yet implemented
     - test-pass-before-impl → test is wrong → rewrite
  3. interface-design — define public API/signatures from test shape
     - pub-ret explicit
     - null@bound
     - DTO≠dom≠val
  4. green — minimal impl to pass test
     - ∅over-engineer
     - ∅skip-to-green (must see red first)
  5. refactor — improve impl under green tests
     - DRY · extract · rename
     - ∀test still pass after each change
  6. repeat → next behavior → step 1
cycle: red→green→refactor→red. exit@∀spec-covered.
rules:
  - ∅impl-w/o-failing-test — test-first ∀feat+fix
  - behav≠impl — test behavior not implementation details
  - determ — tests must be deterministic
  - edges: empty/bounds/concurrency/network
  - untested → block commit
ver:
  - ∀test fail before impl (red witnessed)
  - ∀test pass after impl (green confirmed)
  - cov:∆≥80% · crit-path=100%
  - ∅coverage-gaming (meaningful assert ∅trivial)
fail:
  - test passes before impl → test is wrong → rewrite test
  - can't make test fail → spec already satisfied → skip or tighten spec
  - green requires >50LOC → scope too large → split test
```

---

### kb-templates.md
```
trig: §6.fmt·new-KB-entry·new-ADR·new-playbook·new-tasklog·new-handoff·new-lesson
in: event|decision|incident|task-completion

--- KB Entry ---
| Field    | Content                                    |
|----------|--------------------------------------------|
| Title    | descriptive name                           |
| Tags     | domain tags for retrieval                  |
| Class    | K=verified · I=derived · S=hypothesis      |
| Priority | H/M/L                                      |
| Date     | ISO-8601 + method(observed|inferred|reported) |
| Source   | origin reference                           |
| Context  | when/why this knowledge matters            |
| Knowledge| the actual insight or fact                 |
| Application | how to use it                           |
| Invalidation | conditions that make this stale         |

--- ADR (Architecture Decision Record) ---
| Field       | Content                              |
|-------------|--------------------------------------|
| ID          | ADR-NNN:Title                        |
| Date        | ISO-8601                             |
| Status      | Proposed|Accepted|Deprecated         |
| Context     | what forces are at play              |
| Options     | N≥2 alternatives with ±              |
| Decision    | which option and why                 |
| Consequences| what follows from this decision      |
| Trigger     | conditions to revisit this decision  |

--- Playbook ---
| Field       | Content                              |
|-------------|--------------------------------------|
| Scenario    | what situation this addresses        |
| Triggers    | how to recognize this scenario       |
| Outcomes    | expected results when resolved       |
| Diagnosis   | investigation steps                  |
| Resolution  | fix/mitigation steps                 |
| Verification| how to confirm resolution            |
| Failures    | known failure modes of this playbook |

--- Tasklog ---
Format: `[UTC][#{N}T]|Status|Commit:{s}|Scope|KB-refs|Evidence/Decisions/Gates|Reviews:Npass/Mfail|Next|Resume-prompt`

--- Handoff ---
Format: `objective·state·risks·next-steps·files-touched·tools-used·gate-status·review-status·branch·#{N}.{s}·uncommitted=0`

--- Lessons ---
Format: `[Date][Pattern]|root-cause|KB-ref|rule-derived|trigger-condition|gate-added`

rules:
  - K=verified: source∧reproducible
  - I=derived: source∧logic chain
  - S=hypothesis: ∅promote silently → require evidence to upgrade to I or K
  - ∅silent-promote · log evidence at each promotion
lifecycle:
  - >60d ∅modified → stale @ prune cycle
  - duplicate → merge
  - invalidated 2× → rewrite
  - review every 5 tasks
```

---

### code-review.md
```
trig: §5.pre-c·§5.pre-mrg·before-commit·before-merge·review-requested
in: changed-files·diff·git-log·§4-gates

phase-1: automated-gates (run first, short-circuit on fail)
  1. Val: lint check → 0warn
     - .editorconfig compliance verified
     - ∅suppress directives added
     - ∅ignore-directive added
     - domain overlay checks (e.g., `dotnet format --verify-no-changes`)
  2. Cor: build → 0warn
     - clean compile, no new warnings
     - all existing tests still pass (regression)
  3. Tst: test suite → 0warn
     - ∀new behavior has test
     - cov:∆≥80% · crit-path=100%
     - AAA structure · 1assert-per-act
     - test-commit < impl-commit in log

phase-2: hostile-review (manual/cognitive, assume code is wrong)
  4. Sec.hostile — review as attacker:
     - ∅secrets/PII in diff
     - injection surfaces: SQL/shell/HTML/template/deserialization
     - auth: correct layer? correct check? bypass possible?
     - input validation: ∀external input validated at boundary
     - ∅new CVE exposure from deps
     - antiforgery on mutating endpoints
     - HTTPS-only
  5. Cor.falsify — try to break it:
     - null inputs? empty collections? boundary values?
     - concurrent access? race conditions?
     - error paths: ∀explicit, ∀tested
     - what happens on timeout? network failure? disk full?
     - 3 failure scenarios enumerated and addressed
  6. Typ — type safety:
     - ∅any/unsafe without justification
     - public return types explicit
     - nullability annotated at boundaries
     - DTO≠domain≠value objects separated

phase-3: design-review (structural quality)
  7. Abs — abstraction audit:
     - generalize? extend existing? reuse? → extract
     - ∅one-offs when pattern exists
     - DRY: ∅duplication (duplication=defect)
     - interface@boundary · impl=internal
     - ∅leaky abstractions
  8. Mnt — maintainability:
     - clear deps · low coupling · high cohesion · SRP
     - ∅circular refs
     - names reveal intent · self-documenting
     - could a new developer understand this without explanation?
     - ∅God-class (>300LOC → split)
  9. Perf — performance:
     - ∅O(n²) without ADR
     - ∅N+1 queries
     - ∅unbounded queries/collections
     - async-all-the-way
     - hot-path identified → benchmark exists

phase-4: process-review (diff discipline)
  10. Doc: ∀pub → xml-doc · ∀non-trivial → comment(what+why) · ∅stale docs
  11. Git: §3fmt · 1unit per commit · ∅drift from task
  12. Diff: goal-only changes · ∅mixed reformatting · non-obvious justified
  13. GDPR: PII annotated · retention defined · ∅PII in logs
  14. API: ∅breaking without ADR+deprecation · contract-test@boundary
  15. Dep: ∅floating versions · ∅deprecated packages · licenses checked

phase-5: pre-merge (§5.pre-mrg, only at merge time)
  16. `git log #{N}` → verify:
      - sequential? 1c per unit? ∅gaps?
      - trail tells a story?
      - test-commit < impl-commit throughout?
      - plan commit exists as first?

verdict: P(pass) | F(fail)
  P → §6.tasklog · proceed
  F → revert → root-cause → which phase/step failed?
     → log in §6.lessons
     → replan if flawed approach
     → redo → re-review
cycle: min 2 per task · max 5 → §5.stuck
fail:
  - same gate fails 3× → rewrite approach, not patch → ADR+skill
  - phase-1 fail → ∅proceed to phase-2 (short-circuit)
  - reviewer disagrees with own prior pass → re-review from phase-1
```

---

### debugging.md
```
trig: §5.F·test-failure·unexpected-behavior·bug-report·error-in-output
in: symptom·error-message·reproduction-steps·expected-vs-actual

steps:
  1. reproduce — confirm the failure exists
     - capture exact error message/stack trace
     - identify minimal reproduction steps
     - confirm it fails deterministically (not flaky)
     - if can't reproduce → gather more evidence, ∅guess
     - document: what was expected vs what happened

  2. isolate — narrow the scope
     - when did it last work? (git bisect if unclear)
     - which component/layer/file?
     - does it fail in isolation or only in integration?
     - strip context until failure disappears → last removed = suspect
     - binary search: disable half the change, test, repeat

  3. hypothesize — form testable theories
     - generate ≥2 hypotheses (∅anchor on first guess)
     - rank by: probability · testability · blast-radius
     - for each hypothesis: what evidence would confirm? what would refute?
     - check lessons.md for matching patterns
     - ∅assume → verify

  4. verify — test the hypothesis
     - write a test that exposes the bug (TDD red step)
     - if hypothesis wrong → eliminate, next hypothesis
     - if hypothesis right → identify root cause (not just symptom)
     - root cause = the change/condition that, if fixed, prevents recurrence
     - ∅fix symptoms — fix causes

  5. fix — minimal correct change
     - fix addresses root cause, not surface symptom
     - test from step 4 now passes (green)
     - ∀existing tests still pass (regression check)
     - change is minimal: ∅opportunistic refactoring during bugfix
     - error paths explicit for the failure mode

  6. regression — prevent recurrence
     - test from step 4 is permanent (committed)
     - review: could this class of bug occur elsewhere?
     - if pattern → add to lessons.md with trigger condition
     - if gate should have caught it → strengthen gate in §4

rules:
  - evidence before theory — ∅speculate without reproduction
  - root cause before fix — ∅patch symptoms
  - ≥2 hypotheses — avoid anchoring bias
  - test before fix — TDD applies to bugs too
  - ∅blame — focus on mechanism, not person/commit
  - time-box: 5 cycles max → escalate per §5

ver:
  - bug reproduced with test (step 1-2)
  - root cause identified and documented (step 3-4)
  - fix passes new test + all existing tests (step 5)
  - lesson logged if pattern detected (step 6)

fail:
  - can't reproduce → gather logs/metrics, ask for more context, ∅guess-fix
  - all hypotheses eliminated → widen scope, fresh eyes, escalate
  - fix breaks other tests → revert, re-isolate, scope was wrong
  - same bug class recurs → lessons.md entry missed → add gate to §4
```

---

### context-handoff.md
```
trig: §5.ctx>60%·§5.ctx>85%·session-ending·∀stop·explicit-handoff-request
in: current-task-state·uncommitted-work·decision-history

phases:
  checkpoint (ctx>60%):
    1. commit all gated work — ∅uncommitted changes survive context loss
    2. update tasks/tasklog.md with current state
    3. note decision rationale for in-progress choices
    4. continue working — this is a save point, not a stop

  handoff (ctx>85% | session-end | ∀stop):
    1. secure-state — ensure nothing is lost
       - commit all passing, gated work
       - stash or note any uncommitted experimental work
       - verify: `git status` clean or explicitly noted

    2. write tasks/handoff.md:
       objective: what are we trying to achieve (1-2 sentences)
       state: what is done, what is in progress, what is blocked
         - list completed items with commit refs
         - list in-progress items with current status
         - list blocked items with blocker description
       risks: what could go wrong if resumed naively
         - known fragile areas
         - assumptions that need re-verification
         - time-sensitive elements
       next-steps: ordered list of what to do next
         - be specific: "implement X in file Y" not "continue working"
         - include which §4 gates are pending
         - note any decisions that were deferred
       files: every file touched, created, or deleted
       tools: skills, agents, MCP servers used
       gates: which §4 gates have passed, which are pending
       review-status: Npass/Mfail from §5 cycles
       branch: #{N}.{s} — current branch and commit step
       uncommitted: 0 (must be 0; if not, explain why)

    3. write resume-prompt — a prompt the next session can use
       - format: "Continue #{N}. State: [1-line]. Next: [specific action]."
       - include the branch name
       - include the next commit step number
       - reference any critical decisions from this session
       - test: could someone with ∅context of this session resume from this?

    4. update tasks/tasklog.md — final entry for this session
       - format per §6: `[UTC][#{N}T]|Status|C:{s}|Scope|KB|Ev/Gates|Rev|Next|Resume`

    5. KB lifecycle — per §1b.evolve
       - update kb/index.md if new knowledge created
       - flag stale entries encountered during work
       - log lessons learned in tasks/lessons.md

rules:
  - ∅uncommitted work at handoff — commit or explicitly document
  - resume-prompt must be self-contained — ∅assume prior context
  - handoff.md is overwritten each stop (not appended)
  - next-steps must be actionable — "implement" not "think about"
  - if task is abandoned: include ADR reference explaining why

ver:
  - `git status` → clean (or documented exceptions)
  - handoff.md has all fields populated
  - resume-prompt is testable: read it cold → can you start?
  - tasklog has final entry for session
  - ∅orphaned decisions (all choices documented with rationale)

fail:
  - uncommitted work at ctx>85% → emergency commit with WIP marker → note in handoff
  - can't summarize state → task was too vague → note this as lesson
  - handoff too long (>50 lines) → scope was too large → note for next session to split
```

---

### refactoring.md
```
trig: tech-debt·extraction-needed·restructuring·smell-detected·∅new-behavior(pure-refactor)
in: target-code·smell-description·desired-structure

precondition: ∅refactor without tests. If coverage insufficient → write characterization tests first.

steps:
  1. identify — name the problem
     - what smell? (duplication, God class, feature envy, long method, shotgun surgery, etc.)
     - where? (files, classes, methods)
     - why now? (blocking feature work, causing bugs, maintenance burden)
     - scope: how many files/LOC affected?
     - >10 files → split into smaller refactors, each independently shippable

  2. characterize — capture current behavior
     - run existing tests → all pass (baseline)
     - measure coverage of target code
     - if coverage < 80% → write characterization tests first
       - characterization test: captures WHAT code does, not what it SHOULD do
       - test current behavior including edge cases and error paths
       - these tests are the safety net — they must pass before AND after
     - document the current behavior in plain language

  3. plan — design the target structure
     - what does the code look like after refactoring?
     - which refactoring patterns apply? (extract method/class, move, rename, inline, etc.)
     - identify dependencies that will change
     - sequence: which steps can be done independently?
     - each step must leave tests green — ∅big-bang refactor
     - ADR if architectural change (new module boundaries, new abstractions)

  4. execute — small, verified steps
     - one transformation at a time
     - after each transformation: run tests → ∀pass
     - if tests fail → revert last transformation → investigate
     - commit at each stable point (∅bundle multiple transformations)
     - commit type: `#{N}.{s}.refactor:description`
     - ∅behavior changes — refactoring changes structure, not behavior
     - ∅new features smuggled in — separate branch if needed

  5. verify — confirm equivalence
     - ∀original tests pass (behavior preserved)
     - ∀characterization tests pass (nothing changed)
     - run §4 gates on refactored code:
       - Abs: is the new structure actually better?
       - Mnt: clearer deps? lower coupling? higher cohesion?
       - Kode: names reveal intent? length proportional to complexity?
     - manual review: does a new developer understand this better now?
     - performance: ∅regression on hot paths (benchmark if applicable)

  6. cleanup — remove scaffolding
     - characterization tests: keep if they test real behavior, remove if redundant
     - update documentation if public API changed
     - update kb if pattern is reusable

rules:
  - ∅behavior changes during refactoring — separate concerns
  - ∅refactoring without tests — safety net required
  - small steps, each green — ∅big-bang transformations
  - each commit = one transformation = tests green
  - if smell recurs → extract pattern → create skill or §4 gate
  - DRY is mandatory — duplication found during refactoring must be resolved

ver:
  - ∀tests pass before, during, and after
  - code is measurably better: fewer deps, clearer names, less duplication
  - ∅behavior change (identical outputs for identical inputs)
  - git log shows small, sequential refactor commits

fail:
  - tests fail after transformation → revert → re-examine assumption
  - refactoring reveals bug → stop refactoring → file bug → fix via debugging skill → resume
  - scope grows beyond plan → stop → re-plan → split
  - can't verify equivalence → coverage too low → write more characterization tests
```

---

### security-audit.md
```
trig: §4a.Sec·new-endpoint·auth-change·external-input·dependency-update·pre-release
in: target-scope(files|endpoints|components)·threat-model(if exists)

phase-1: surface-scan (automated, fast)
  1. secrets — scan diff and staged files
     - ∅hardcoded passwords, API keys, tokens, connection strings
     - ∅PII in code, comments, or test fixtures
     - verify .gitignore covers: .env, *.key, *.pem, credentials.*, secrets.*
     - check for secrets in git history if new repo/contributor

  2. dependencies — supply chain
     - `audit` command for language (npm audit, dotnet list package --vulnerable, pip audit, etc.)
     - ∅known CVEs in direct or transitive deps
     - ∅deprecated packages
     - licenses: allow-list(MIT, Apache2, BSD) · flag others
     - ∅new deps without justification

  3. static-analysis — tooling output
     - security analyzers enabled and passing (0warn)
     - ∅suppressed security warnings without reviewed justification
     - HTTPS-only enforced

phase-2: injection-review (manual, per-surface)
  4. SQL injection
     - ∀database queries: parameterized or ORM-generated
     - ∅string concatenation in queries
     - ∅raw SQL without explicit parameterization
     - stored procedures: parameters typed and validated

  5. command injection
     - ∀shell/process invocations: arguments escaped/validated
     - ∅user input passed directly to shell
     - prefer library calls over shell execution

  6. XSS / template injection
     - ∀user-generated content: encoded on output
     - ∅raw HTML rendering of user input
     - CSP headers configured
     - template engines: auto-escaping enabled

  7. deserialization
     - ∅untrusted deserialization without type filtering
     - ∅BinaryFormatter or equivalent unsafe deserializers
     - JSON/XML: schema validation on input

phase-3: auth/authz review
  8. authentication
     - correct layer: auth happens before business logic
     - ∅bypass paths (every route explicitly authenticated or marked anonymous)
     - session/token management: secure, httponly, samesite
     - password handling: hashed, salted, ∅plaintext anywhere

  9. authorization
     - ∅privilege escalation paths
     - resource-level checks (not just role-based)
     - ∅IDOR (insecure direct object reference)
     - default-deny: access explicitly granted, not implicitly allowed

  10. input validation
      - ∀external input validated at boundary
      - type, range, length, format checks
      - ∅trust internal representations of external data
      - antiforgery tokens on mutating endpoints

phase-4: data-protection (GDPR/compliance)
  11. PII handling
      - PII annotated ([PersonalData] or equivalent)
      - retention policy defined per entity
      - audit trail on PII mutations
      - soft-delete for PII (∅hard delete without policy)
      - encrypted at rest
      - ∅PII in logs (structured logging with redaction)

  12. data boundaries
      - PII ∅crosses service boundaries without encryption
      - data export capability for user requests
      - consent tracked at collection point
      - DPIA completed for new processing activities

rules:
  - phase-1 short-circuits: ∅proceed to phase-2 if secrets found
  - every finding = fix or documented exception with justification
  - ∅homebrew crypto — use established libraries
  - ∅X509 validation skip in production
  - audit:0warn before commit

ver:
  - ∀phases completed for scope
  - ∅open findings without fix or documented exception
  - automated scans pass (0warn)
  - injection surfaces reviewed per type
  - auth boundaries verified

fail:
  - secret found → remove from history (git filter-branch/BFG) → rotate credential → incident report
  - CVE found → assess severity → patch or mitigate → document in ADR if can't patch
  - auth bypass found → block commit → fix before proceeding
  - ∅time for full audit → document skipped phases → create follow-up task
```

---

### api-design.md
```
trig: new-api·new-endpoint·api-redesign·§4b.API
in: requirements·consumer-needs·domain-model

steps:
  1. contract-first — design before implementation
     - identify consumers: who calls this API? what do they need?
     - define resources and operations (REST) or procedures (RPC)
     - write OpenAPI spec (or equivalent schema) BEFORE code
     - OpenAPI = source of truth — code is generated/validated against it
     - version strategy: version in route (e.g., /v1/) from day one

  2. model — request/response design
     - DTO-validation at entry point (∅domain objects in API surface)
     - request: minimal required fields · optional with defaults · validated
     - response: consistent envelope · pagination for collections · error format
     - ProblemDetails (or equivalent) for error responses
     - ∅exposing internal IDs or implementation details
     - ∅over-fetching: return what consumer needs, not entire entity

  3. safety — API-specific security
     - authentication required on all endpoints (or explicitly anonymous)
     - authorization: resource-level, not just route-level
     - rate-limiting on public endpoints
     - idempotency-key on mutating operations
     - input validation: type, range, length, format at boundary
     - ∅mass-assignment: explicit DTO mapping, ∅auto-bind to domain

  4. contract-tests — verify against spec
     - write contract tests BEFORE implementation (test-first)
     - test: request validation (reject bad input)
     - test: response shape matches spec
     - test: error responses match ProblemDetails format
     - test: auth/authz boundaries enforced
     - test: pagination, filtering, sorting work correctly
     - test: idempotency-key prevents duplicate mutations

  5. implement — build to pass contract tests
     - handler per endpoint (vertical slice or controller)
     - map DTO → domain at boundary
     - map domain → DTO at boundary
     - ∅business logic in controller/handler — delegate to domain
     - async-all-the-way
     - structured logging with correlation ID

  6. document — make it consumable
     - OpenAPI spec complete: summary, param descriptions, examples, error codes
     - README for API project
     - breaking change policy documented
     - deprecation cycle: announce → sunset period → remove

rules:
  - ∅breaking changes without ADR + deprecation cycle
  - OpenAPI spec = source of truth (∅spec drift from implementation)
  - contract tests run in CI — spec violations block merge
  - versioning at route level, not header (simpler, more visible)
  - ∅new endpoint without contract test
  - pagination mandatory for collection endpoints (∅unbounded queries)

ver:
  - OpenAPI spec exists and is valid
  - contract tests pass
  - ∀endpoints authenticated or explicitly anonymous
  - rate-limiting configured on public endpoints
  - error responses use consistent format
  - ∅breaking changes without deprecation notice

fail:
  - spec and implementation diverge → fix implementation to match spec
  - consumer needs change → update spec first, then implementation
  - breaking change unavoidable → ADR + version bump + deprecation cycle
  - performance inadequate → profile → optimize → ∅change contract
```

---

### pr-creation.md
```
trig: §3.PR·feature-complete·ready-for-merge·all-gates-pass
in: #{N}·branch·commit-history·§5-review-status

steps:
  1. pre-flight — verify readiness
     - `git status` → clean (∅uncommitted changes)
     - `git log #{N}` → verify commit sequence:
       - sequential? ∅gaps?
       - test-commit < impl-commit throughout?
       - 1c = 1unit? ∅bundled changes?
       - trail tells a coherent story?
     - §5 review: ≥2 cycles completed, all P
     - §4 gates: ∀pass verified
     - branch up to date with target (rebase if solo, merge if shared)

  2. size-check — assess reviewability
     - count commits: {s-count}
     - estimate diff size (files changed, LOC added/removed)
     - >10 files or >500 LOC → consider splitting into stacked PRs
     - each PR should be reviewable in one sitting
     - if split needed → create dependent PRs with clear ordering

  3. write-description
     - title: `#{N} summary` — short (<70 chars), describes the WHAT
     - body structure:
       ## Summary
       - what changed and why (1-3 bullet points)
       - link to issue/task if exists

       ## Changes
       - key technical decisions made (reference ADRs if created)
       - notable implementation choices

       ## Testing
       - what was tested
       - test coverage impact
       - how to verify manually (if applicable)

       ## Checklist
       - [ ] §4 gates pass
       - [ ] Tests pass (including new)
       - [ ] Documentation updated
       - [ ] No secrets/PII in diff
       - [ ] Breaking changes documented (if any)

  4. label-and-link
     - label with commit type T∈{feat,fix,refactor,test,docs,chore}
     - label with size: s-count commits
     - link to issue/ticket if exists
     - assign reviewers if applicable
     - set milestone if applicable

  5. submit — create PR
     - push branch with `-u` if not yet tracked
     - create PR against target branch (usually main)
     - verify CI passes after creation
     - respond to automated checks/feedback

rules:
  - ∅PR without §5 review passing (self-review is minimum)
  - ∅PR with failing CI — fix before requesting review
  - ∅draft PR as excuse to skip gates
  - title is for scanning — put details in body
  - one concern per PR — ∅mixed feature+refactor+fix

ver:
  - PR created with complete description
  - CI passing
  - ∀commits in sequence, properly formatted
  - labels applied
  - no secrets in diff
  - reviewable size (or explicitly justified)

fail:
  - CI fails after PR creation → fix on branch → push → verify
  - PR too large → close → split into stacked PRs → resubmit
  - merge conflicts → rebase/merge from target → resolve → push
  - review feedback → address → new commits (∅force-push over review comments)
```

---

### release.md
```
trig: §3.DEPLOY·release-planned·version-bump-needed·deploy-to-prod
in: release-scope·version·deploy-target

steps:
  1. prepare — verify release readiness
     - all PRs for release merged
     - ∀§4 gates pass on release branch/main
     - ∀tests pass (full suite, not just changed)
     - no open blockers or critical bugs
     - dependency audit current (§4b.Dep: ∅vuln, ∅deprecated, licenses clean)
     - security audit completed for new surfaces (#skill:security-audit)

  2. version — determine version number
     - semver: MAJOR.MINOR.PATCH
     - breaking API change → MAJOR (requires ADR + deprecation completed)
     - new feature, backwards compatible → MINOR
     - bug fix, backwards compatible → PATCH
     - pre-release: append -alpha, -beta, -rc.N as appropriate
     - tag: `v{MAJOR}.{MINOR}.{PATCH}`

  3. changelog — document what shipped
     - generate from commit history since last release
     - group by type: Features, Fixes, Refactors, Breaking Changes
     - each entry: human-readable description + PR/commit reference
     - breaking changes section: migration instructions
     - update CHANGELOG.md
     - commit: `#{N}.{s}.docs:release vX.Y.Z changelog`

  4. tag-and-build — create release artifact
     - create git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
     - build release artifact from tag (not from branch HEAD)
     - verify artifact: runs, passes smoke tests
     - sign artifact if required by policy

  5. deploy — rollout with safety
     - rollback-plan documented BEFORE deploying:
       - what to rollback to (previous version/tag)
       - how to rollback (command/procedure)
       - who can authorize rollback
       - data migration rollback if applicable
     - strategy (choose per risk):
       - canary: deploy to subset → monitor → expand
       - blue-green: deploy to standby → switch traffic → monitor
       - rolling: gradual instance replacement
       - ∅big-bang: never deploy everything at once
     - feature-flags for risky changes (kill switch)

  6. verify — post-deploy checks
     - healthcheck endpoints responding
     - key metrics within baseline (latency, error rate, throughput)
     - smoke tests pass against production
     - monitoring/alerting active
     - hold period: observe for defined duration before declaring success

  7. finalize — close the loop
     - update kb/quality-baselines.md with new measurements
     - close release milestone/ticket
     - announce release (if applicable)
     - archive release branch (if using release branches)
     - retrospective note in tasks/lessons.md if anything was surprising

rules:
  - rollback-plan exists BEFORE deploy — ∅deploy without escape hatch
  - ∅big-bang deploys — incremental always
  - feature-flag risky changes — independent of deploy
  - healthcheck-gate at post-deploy — automated verification
  - ∅skip verification — even "small" releases get checked
  - breaking changes require completed deprecation cycle (not just announced)

ver:
  - version tag exists and matches artifact
  - CHANGELOG.md updated
  - rollback-plan documented
  - deploy strategy chosen and executed
  - healthchecks passing post-deploy
  - monitoring confirms baseline metrics

fail:
  - healthcheck fails post-deploy → execute rollback plan → investigate
  - metrics degrade → rollback → root-cause via #skill:debugging
  - deploy partially fails → halt rollout → assess → rollback or fix-forward
  - rollback fails → escalate immediately → incident response
  - version conflict → verify tag matches artifact → rebuild if mismatch
```

---

### dependency-audit.md
```
trig: §4b.Dep·update-cycle≤30d·new-dependency·pre-release·security-alert
in: project-manifest(package.json|*.csproj|requirements.txt|go.mod|Cargo.toml|etc.)

steps:
  1. inventory — what do we depend on?
     - list all direct dependencies with current versions
     - list transitive dependencies (full dependency tree)
     - note: pinned vs floating versions
     - flag: ∅floating versions (pin to major minimum)

  2. vulnerability-scan — are we exposed?
     - run language-appropriate audit:
       - dotnet: `dotnet list package --vulnerable`
       - node: `npm audit` / `yarn audit`
       - python: `pip audit` / `safety check`
       - go: `govulncheck`
       - rust: `cargo audit`
     - for each finding:
       - severity: critical/high/medium/low
       - exploitable in our context? (not all CVEs apply)
       - fix available? (upgrade path)
       - if no fix: mitigation or documented exception with ADR

  3. freshness — are we current?
     - check each direct dep: latest version vs installed version
     - flag: >30d behind latest → schedule update
     - flag: >90d behind → urgent, likely missing security patches
     - flag: deprecated packages → plan replacement
     - major version behind → evaluate breaking changes before upgrading

  4. license-check — are we compliant?
     - allow-list: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD
     - flag: GPL, AGPL, SSPL, BUSL → legal review required
     - flag: no license / unknown → treat as restrictive → avoid
     - check transitive deps too (license infection)
     - document exceptions with justification

  5. evaluate-update — for each outdated dep
     - read changelog: breaking changes? migration needed?
     - check: does our usage touch changed APIs?
     - update in isolation: one dep at a time
     - run full test suite after each update
     - if tests fail → root-cause → fix or defer with justification

  6. report — document state
     - update kb/quality-baselines.md: dependency freshness metric
     - log findings in tasks/tasklog.md
     - create issues for deferred updates with timeline
     - ADR for any dep replacement decisions

rules:
  - pin-major: ∅floating versions · pin to known-good
  - ∅transitive-vuln: vulnerabilities in transitive deps count
  - ∅deprecated-pkg: plan replacement before it breaks
  - update-cycle ≤ 30d: run this audit monthly minimum
  - one update per commit: ∅bundle dep updates (isolate failures)
  - ∅new dep without justification: do we really need this?

ver:
  - audit command returns 0 vulnerabilities (or all documented exceptions)
  - ∅floating versions in manifest
  - ∅deprecated packages without replacement plan
  - all licenses on allow-list (or documented exceptions)
  - freshness: ∅dep >90d behind without justification

fail:
  - critical CVE found → patch immediately → hotfix workflow if in production
  - update breaks tests → revert → investigate → may need code changes
  - license violation found → remove dep → find alternative → ADR
  - deprecated dep with no replacement → assess risk → timeline to replace → ADR
```

---

### kb-prune.md
```
trig: §6.lifecycle·rev/5tasks·>60d-flag·explicit-prune-request
in: kb/index.md·kb/**/*.md·tasks/lessons.md·tasks/tasklog.md

steps:
  1. scan — identify candidates
     - query all KB entries (kb/domains/, kb/decisions/, kb/playbooks/)
     - flag: >60d since last modified → stale candidate
     - flag: >30d since last modified → review candidate (§6: flag>30d)
     - flag: referenced 0 times in recent tasklog → potentially unused
     - flag: S-class entries (hypothesis) older than 30d → promote or remove
     - count: total entries, entries per domain, entry ages

  2. assess — evaluate each flagged entry
     for each stale candidate:
     a. still accurate?
        - verify against current codebase (code may have changed)
        - check: does the file/function/pattern it references still exist?
        - if inaccurate → mark for rewrite or removal
     b. still relevant?
        - is this knowledge still needed for current/planned work?
        - has the domain/feature been deprecated or removed?
        - if irrelevant → mark for archival
     c. duplicated?
        - search for overlapping entries covering same topic
        - if duplicate → mark for merge (keep the richer one)
     d. classification correct?
        - K(verified): still verified? source still valid? reproducible?
        - I(derived): logic chain still holds?
        - S(hypothesis): evidence gathered? → promote to I/K or remove
        - ∅silent promotion — log evidence at each class change

  3. act — resolve each flagged entry
     - stale + accurate + relevant → update date, verify content, keep
     - stale + inaccurate → rewrite with current information → reset date
     - stale + irrelevant → move to archive (∅delete — may be useful for history)
     - duplicate → merge into single entry → redirect/remove duplicate
     - invalidated 2× → full rewrite (§6: inv2×→rewrite)
     - S-class without evidence after 30d → remove or demote to note
     - unused entries → verify irrelevance → archive if confirmed

  4. ADR maintenance — special handling
     - ADR status review:
       - Accepted + trigger conditions met? → revisit decision
       - Accepted + >6 months → still valid? context changed?
       - Deprecated → consequences handled? references updated?
     - ∅delete ADRs — they are historical record. Mark Deprecated, don't remove.

  5. update-index — reflect changes
     - update kb/index.md:
       - remove archived entries
       - add new entries created during prune
       - update status indicators (active/stale/dormant)
       - update "Updated" date
     - update kb/memory-map.md:
       - refresh Last-verified dates for reviewed entries
       - update Status column
     - log prune activity in tasks/tasklog.md

  6. metrics — measure KB health
     - total entries (before/after)
     - entries pruned/merged/rewritten/archived
     - average age of active entries
     - % of entries verified in last 30d
     - update kb/quality-baselines.md if tracking KB metrics

rules:
  - review every 5 tasks (§6: rev/5) — ∅defer indefinitely
  - >60d unmodified → dormant (§6: >60d→dormant)
  - invalidated 2× → full rewrite not patch
  - ∅delete ADRs — deprecate only
  - ∅silent promote S→I→K — require logged evidence
  - merge > delete — preserve knowledge, reduce duplication

ver:
  - kb/index.md updated with current dates
  - ∅entries >90d without review
  - ∅duplicate entries
  - ∅S-class entries >30d without evidence assessment
  - all ADRs have current status
  - prune activity logged in tasklog

fail:
  - can't determine if entry is still accurate → flag for domain expert review
  - merge conflict between entries → keep both, note conflict, resolve next prune
  - too many entries to prune in one session → prioritize by: age desc, S-class first
  - KB empty after prune → over-pruned → review archive → restore if needed
```

---

### retrospective.md
```
trig: §1b.evolve·every-3-5-tasks·milestone-complete·pattern-detected·post-incident
in: tasks/tasklog.md·tasks/lessons.md·kb/agent-registry.md·recent-session-history

steps:
  1. gather — collect evidence from recent work
     - read tasks/tasklog.md: last 3-5 task entries
     - read tasks/lessons.md: recent entries
     - scan commit history: patterns in commit types, revert frequency
     - note: what tools/skills/agents were used and how often
     - note: which §4 gates failed most frequently
     - note: which tasks took more cycles than expected

  2. identify-patterns — find recurring themes
     patterns to look for:
     a. repeated-workflow: same sequence of steps done 3+ times
        → candidate for skill extraction
     b. repeated-agent-use: same agent configuration used 3+ times
        → candidate for agent-registry permanent entry
     c. repeated-external-tool: same CLI/API called repeatedly
        → candidate for MCP server
     d. repeated-config: same settings applied across tasks
        → candidate for plugin or settings
     e. repeated-failure: same §4 gate failing across tasks
        → §4 gate needs strengthening or approach needs rethinking
     f. repeated-lesson: same lesson logged multiple times
        → not being applied → needs stronger gate or skill
     g. estimation-miss: tasks consistently over/under-scoped
        → estimation heuristics need calibration

  3. evaluate — assess each pattern for promotion
     for each identified pattern:
     - frequency: how often? (3+ = promotion threshold)
     - cost: what does it cost to NOT automate/codify?
     - stability: is the pattern settled or still evolving?
     - complexity: 3+ steps? worth the overhead of a skill?

     promotion matrix (§1b.evolve):
     | Pattern type | Frequency | Promote to |
     |---|---|---|
     | workflow sequence | 3+ tasks | .github/skills/{name}.md |
     | agent configuration | 3+ uses | kb/agent-registry.md (permanent) |
     | external tool use | repeated + shared | .mcp.json server |
     | skill+agent+hook combo | 2+ of these × repo | plugin |
     | config pattern | 3+ tasks | .github/settings.json |

  4. promote — create the artifact
     per promotion type:
     a. skill: follow §7b format: trig/in/step/ver/fail/gate
        - write to .github/skills/{name}.md
        - test: does it cover the cases from tasklog?
     b. agent: add permanent row to kb/agent-registry.md
        - Pat|When|Agents|Model|Tools|Skills|MCP|Risk-gates|History
     c. MCP: add server to .mcp.json
        - purpose, surface area, auth, defaults documented
     d. plugin: package 2+ of (skill/agent/hook/MCP/settings)
        - cross-repo applicability verified
     e. gate-strengthening: update §4 gate or create ADR
        - if same gate fails 3× → rewrite approach → ADR + new skill

  5. update-protocol — evolve AOP itself
     - assess: does the protocol need updating?
     - ∆≥3 optimizations → minor version bump (§1b: proto:∆≥3opt→minor)
     - ∆ breaking change → major version bump (§1b: proto:∆break→major)
     - update AGENT.md if workflow rules changed
     - ∅change protocol without evidence from retrospective

  6. record — document the retrospective
     - log in tasks/tasklog.md: retrospective entry with findings
     - update tasks/lessons.md: new lessons from pattern analysis
     - update kb/index.md: new entries created
     - note: what was promoted, why, and expected impact

rules:
  - every 3-5 tasks minimum (∅defer indefinitely)
  - evidence-based: ∅promote based on feeling — show the pattern in tasklog
  - temp→perm threshold: 3+ successful uses
  - ∅over-promote: if pattern isn't stable, leave as temp
  - skill creation criteria (§7b): 3+ tasks · consistent pattern · 3+ steps
  - promotion is one-way until deprecated: ∅remove without ADR

ver:
  - patterns identified and documented
  - promotions justified with tasklog evidence
  - artifacts created correctly (skill format, registry format, etc.)
  - protocol version updated if changes warrant
  - retrospective logged in tasklog

fail:
  - no patterns found → normal, not every retro produces promotions
  - too many patterns → prioritize by: frequency × cost
  - promoted skill doesn't fit real usage → rewrite or demote → lesson
  - protocol change breaks workflow → revert → ADR → more careful change
```

---

### domain-dotnet.md
```
trig: *.csproj ∨ *.sln ∨ *.cs detected · lang=dotnet
overlay-on: §4a core gates. Apply WITH core, not instead of.
∀gate:0warn applies to all domain additions.

Val+:
  - `dotnet format --verify-no-changes`
  - IDE+CA+SA: all analyzers enabled
  - TreatWarningsAsErrors=true
  - Nullable=enable
  - ∅#pragma-warn-disable
  - ∅SuppressMessage(unreviewed)
  - ∅obsolete(self-authored)
  - WarningLevel=9999
  - AnalysisLevel=latest-All
  - EnforceCodeStyleInBuild=true

Cor+:
  - build:0warn (TreatWarningsAsErrors enforces)

Sec+:
  - HttpClient.new → IHttpClientFactory
  - ∅BinaryFormatter
  - ∅fixed∅ADR (unsafe pinning)
  - ∅allow-list(unreviewed)
  - raw-SQL → parameterized ∨ EF-LINQ

Typ+:
  - record∨sealed(DTO)
  - IAsyncDisposable @ async resources
  - CancellationToken @ async public methods
  - ∅sync-over-async (Task.Result/.Wait) → await
  - Result<T> ∨ Exception — choose 1 per project, be consistent
  - ProblemDetails @ API error responses
  - ∅catch-all (∅empty-catch) — let framework handle
  - domain-err → domain exceptions · infra-err → infra exceptions

Tst+:
  - ∅Thread.Sleep → Task.Delay
  - ∅DateTime.Now → TimeProvider (abstract time)
  - xUnit IClassFixture/ICollectionFixture @ shared setup
  - FluentAssertions ∨ Verify @ assertions
  - ∅catch-assert — let exceptions throw, assert with Should().Throw

Perf+:
  - ∅N+1 queries: EF → .Include() | split query | projection
  - ∅Enumerable chains on DB → IQueryable (server-side eval)
  - pool @ HttpClient (via IHttpClientFactory)

Abs+:
  - ∅leaky-abs: EF/DbContext ∅leak into app/domain layer
  - MediatR ∨ vertical-slice @ request handlers

Mnt+:
  - Options-pattern @ config binding
  - ILogger<T> @ class-level logging
  - ∅Console.Write → ILogger
  - structured-log: ∅string-interpolation → message template
  - correlationId @ request pipeline

MIG+:
  - ∅EnsureCreated(prod) — migrations only
  - EF migrations preferred
  - `dotnet ef migrations add` → review generated SQL

ver: `dotnet build` → 0warn · `dotnet test` → ∀pass · `dotnet format --verify-no-changes` → clean
```

---

### domain-template.md
```
trig: new project language detected · ∅existing domain-{lang}.md
in: detected language/framework

Template — copy and customize for new language:

  trig: {file-pattern} detected · lang={language}
  overlay-on: §4a core gates. Apply WITH core.

  Val+: {language-specific linting/formatting}
  Cor+: {language-specific build/compile rules}
  Sec+: {language-specific security anti-patterns}
  Typ+: {language-specific type system rules}
  Tst+: {language-specific test framework rules}
  Perf+: {language-specific performance patterns}
  Abs+: {language-specific abstraction boundaries}
  Mnt+: {language-specific maintainability rules}
  MIG+: {language-specific migration tooling}

  ver: {build-cmd} → 0warn · {test-cmd} → ∀pass · {lint-cmd} → clean

rules:
  - only add items not covered by core §4a gates
  - use + suffix to indicate overlay (additive)
  - name file: domain-{lang}.md
  - register in §7b when used 3+ times
```

---

### workflow-feature.md
```
trig: new-feature · new-task · #{N} assigned
in: requirement·#{N}·branch-scope
seq:
  1. §2.plan — scan lessons → write todo.md → candidates → chosen+gates
  2. §3.branch — `#{N}-slug` from main
  3. #skill:commit-workflow.1 — plan commit
  4. #skill:tdd-workflow — red→green→refactor cycle(s)
     ∀cycle produces: commit-workflow.2(test) → commit-workflow.3(feat) → commit-workflow.4(refactor)
  5. §5.review — min 2 cycles · §4 gates ∀pass
  6. #skill:commit-workflow.5 — docs commit (final)
  7. §5.pre-mrg — git log #{N} → verify sequence
  8. PR → label:T · size:{s-count}c → merge
gates:
  - §4 ∀pass at each commit
  - test-commit < impl-commit throughout
  - ∀commit = 1 logical unit
  - §5.P before merge
abort:
  - §5.stuck@5cyc → handoff
  - revert.depth>2 → abandon+ADR
  - scope-creep detected → halt → replan
```

---

### workflow-hotfix.md
```
trig: prod-bug · P0/P1 · hotfix-needed
in: incident-report · reproduction-steps
seq:
  1. §3.hotfix-branch — `#{N}-hotfix-slug` from main
  2. reproduce — confirm bug exists · capture evidence
  3. #skill:tdd-workflow — test-for-bug(red) → fix(green) → verify
  4. §5.review — min 1 cycle · §4.Cor+Sec+Tst gates
  5. merge → main
  6. cherry-pick → release branch
  7. rollback-plan documented
gates:
  - fix-only — ∅new features · ∅refactoring
  - §4.Cor+Sec+Tst ∀pass
  - rollback-plan exists before merge
  - ∅scope-creep — fix the bug, nothing else
abort:
  - fix introduces new failures → revert → escalate
  - root-cause unclear after 3 cycles → escalate to team
```

---

### workflow-migration.md
```
trig: schema-∆ · data-∆ · db-migration-needed
in: schema-change-spec · data-transformation-spec
seq:
  1. ADR — document why migration is needed · options · decision
  2. up-script — forward migration · idempotent
  3. down-script — reverse migration · must fully undo up
  4. test — up → verify-state → down → verify-original → up → verify-state
  5. commit — 1mig=1commit · data-mig ≠ schema-mig (separate commits)
gates:
  - reversible: up+down both work
  - idempotent: running twice = running once
  - data-mig ≠ schema-mig — never combine in one migration
  - seed ∅ mig — seed data is separate from migrations
  - ∅destructive ∅ ADR — dropping columns/tables requires ADR justification
  - domain:dotnet → ∅EnsureCreated(prod) · EF migrations preferred
abort:
  - down-script fails → migration is not ready
  - data loss detected → halt · ADR required
  - migration >30s on test data → split into smaller steps
```

### engine-claude.md
```
trig: §7e.engine-dispatch·claude-model-delegation·sonnet-task·haiku-task
in: prompt·model(sonnet|haiku)·allowedTools·working-dir·budget-usd·timeout
steps:
  1. validate — model ∈ {sonnet,haiku}. allowedTools matches §7a access. ∅opus delegation.
  2. construct — `claude -p --model {m} --allowedTools "{tools}" --output-format json --no-session-persistence --max-budget-usd {$} --fallback-model haiku`
  3. invoke — pipe prompt via stdin, capture stdout+stderr, enforce timeout
  4. parse — extract JSON result field, validate against --json-schema if set
  5. safety-check — ∅secrets in output, ∅out-of-scope modifications
  6. log — `[UTC][#{N}T.engine:claude-{model}]|status|duration|budget|tools`
access-mapping:
  RO → --allowedTools "Read,Grep,Glob"
  r+t → --allowedTools "Read,Grep,Glob,Bash"
  w(src,test,cfg) → --allowedTools "Read,Edit,Write,Bash,Glob,Grep"
fallback: sonnet → haiku → opus(manual)
fail: timeout→kill→fallback · budget-exceeded→fallback · secrets→BLOCK→@agt:sec-rev
```

### engine-codex.md
```
trig: §7e.engine-dispatch·codex-eligible-task·green-phase·code-review-request
in: task-type(exec|review)·prompt·working-dir·sandbox(read-only|workspace-write)·timeout
steps:
  1. validate — codex available, working-dir is git repo, sandbox matches §7a access
  2. construct — exec: `codex exec -C {dir} -s {sandbox} --full-auto --json "{prompt}"` / review: `codex review --uncommitted -C {dir} --json`
  3. invoke — execute, capture JSONL stdout+stderr, enforce timeout
  4. parse — filter JSONL for response events, extract files-modified+reasoning
  5. safety-check — ∅secrets, ∅out-of-scope modifications, diff against pre-state
  6. log — `[UTC][#{N}T.engine:codex]|task-type|status|duration|sandbox|files`
access-mapping:
  RO|r+t → -s read-only
  w(src,test,cfg) → -s workspace-write
fail: timeout→kill→fallback · secrets→BLOCK · out-of-scope→revert→escalate
```

### engine-gemini.md
```
trig: §7e.engine-dispatch·gemini-eligible-task·analysis-task·critique-task
in: prompt·working-dir·approval-mode(plan|auto_edit)·timeout
steps:
  1. validate — gemini available, approval-mode matches §7a access
  2. construct — `gemini --prompt "{p}" --approval-mode {mode} --output-format json --include-directories "{dir}"`
  3. invoke — execute, capture JSON stdout+stderr, enforce timeout
  4. parse — extract analysis/findings/recommendations from JSON
  5. safety-check — ∅secrets, ∅out-of-scope modifications (if auto_edit)
  6. log — `[UTC][#{N}T.engine:gemini]|status|duration|approval-mode|scope`
access-mapping:
  RO|r+t|r+sh → --approval-mode plan
  w(src,test,cfg) → --approval-mode auto_edit
fail: timeout→kill→fallback · secrets→BLOCK · parse-error→fallback
```

### engine-dispatch.md
```
trig: §7e.dispatch·engine-eligible-step·model-selection-needed
in: task-type·complexity(critical|medium|simple)·agent-access·scope·dispatch-mode(single|parallel|race)
steps:
  1. classify — match task vs model-selection-matrix
  2. map-access — §7a access → engine constraints (allowedTools/sandbox/approval-mode)
  3. construct-prompt — build engine-specific prompt with context
  4. dispatch — single: one engine | parallel: all concurrent→merge | race: first-to-pass-§4
  5. validate — §4 gates on all output (untrusted until gates pass)
  6. accept-or-reject — pass→return · fail→fallback chain · partial→accept passing portions
  7. cost-log — track per-model per-task-type
model-tiers:
  critical → opus(self) | medium → sonnet∥codex | simple → haiku | analysis → gemini
fallback-chains:
  sonnet→haiku→opus(manual) · codex→sonnet→manual · gemini→sonnet→manual
rules:
  - engine permissions ≤ agent permissions — INVARIANT
  - ∀output untrusted → §4 gates
  - 3×fail-same-type → disable+log
  - eng∥agt (never serial) · agt-authoritative · eng-supplementary
```

### engine-review-synthesis.md
```
trig: §5.parallel-review·multi-engine-review·multi-model-review
in: review-outputs[]·source-engines[]
steps:
  1. collect — gather all engine/model review outputs (opus+sonnet+codex+gemini)
  2. normalize — convert to common format: {file,line,severity,phase(§4),description,source}
  3. deduplicate — same file+line+issue from multiple engines → merge, note "confirmed by N engines"
  4. surface-conflicts — engines disagree on severity → flag for human review, ∅auto-resolve
  5. synthesize — union of all findings, highest severity wins, PASS only if ∀agree+§4 pass
  6. report — findings by §4 phase, source attribution, conflicts section, agreement stats
rules:
  - ∅silently drop findings · severity=max(all engines) · conflicts→surface
  - opus verdict authoritative when engines conflict
  - §4 gates override all engine verdicts (ground truth)
```

---

## §S3 !agents — write each to .github/agents/{name}.agent.md

All agents follow §7 dispatch rules. ∀independent-agents→dispatch-∥. ∅sequential-when-∥-possible.
§7e engine dispatch: agents delegate to models per tier (critical→opus·medium→sonnet∥codex·simple→haiku·analysis→gemini).

### planner.agent.md
```
---
name: planner
description: 'planner'
---
# Agent: planner
type: plan
access: RO
skills: [workflow-feature, workflow-hotfix, workflow-migration]
triggers: [task-start, new-requirement, re-plan-needed, scope-change]

## Charter
Reads requirements → decomposes into structured plan in tasks/todo.md per §2. Scans lessons.md and kb/index.md for prior pitfalls. Evaluates N≥2 candidates with pros/cons/risk/abstraction/reuse/maintainability. Selects with justification. Estimates scope, flags >10 files. Mandatory first agent on every task. ∅code before plan.

## Input
- User requirement or task description
- AGENT.md, .editorconfig, codebase structure
- kb/index.md, tasks/lessons.md, kb/agent-registry.md

## Output
- tasks/todo.md per §2 format (Goal/Facts/Unknowns/KB/Candidates/Chosen/Why/Risks/Gates/Verify/Delegate/Done)
- Scope estimate, agent dispatch order

## Boundaries
- ∅write code · ∅implementation decisions · ∅modify src/test/cfg
- ∅approve own plan (critic must review)
- Output = plan only

## Escalation
- Ambiguous requirements → user for clarification
- Plan reviewed → @agt:critic for failure analysis
- Plan approved → @agt:implementer for execution
- API design needed → @agt:api-architect
```

### critic.agent.md
```
---
name: critic
description: 'critic'
---
# Agent: critic
type: crit
access: RO
skills: []
triggers: [post-plan, pre-implement, post-implement, pre-review, design-decision]

## Charter
Takes plan OR implementation → enumerates exactly 3 failure modes → challenges assumptions → identifies risks. ∅solutions. ∅alternatives. ∅opinions. Only failure modes backed by evidence. Invoked minimum 2× per task: post-plan and post-implementation.

## Input
- Plan (tasks/todo.md) OR implementation diff/code
- Original requirement, relevant KB entries
- Prior critic findings (avoid repetition)

## Output
- Exactly 3 failure modes, each with: failure description, trigger conditions, evidence, impact severity, assumption challenged
- Risk summary (Low/Medium/High/Critical)
- Assumptions inventory (validated/unvalidated)
- ∅solutions. ∅alternatives. ∅opinions.

## Boundaries
- ∅propose solutions · ∅write code · ∅express preference
- ∅modify files · ∅run commands
- Must produce exactly 3 failure modes (not fewer, not more)

## Escalation
- Critical risk → @agt:planner for re-plan
- Security vulnerability → @agt:security-reviewer
- Implementation failures → feed to @agt:reviewer as priority checklist
```

### reviewer.agent.md
```
---
name: reviewer
description: 'reviewer'
---
# Agent: reviewer
type: rev
access: read+test
skills: [code-review]
triggers: [pre-commit, pre-merge, milestone-complete, cycle-request, post-implement]

## Charter
Executes code-review skill phases 1-5 in strict order. Short-circuits on phase-1 failure. Outputs P/F with line-level findings. Tracks cycle count, enforces min 2 cycles. Runs ∥ with @agt:security-reviewer during §5 review dispatch.

## Input
- Code diff/files, tasks/todo.md, critic findings, .editorconfig, prior review findings, cycle count

## Output
- Phase-by-phase verdict (P/F per phase, short-circuit on phase-1 F)
- Line-level findings: file, line, severity (blocker/warning/info), description
- Overall verdict: PASS or FAIL
- Cycle count: "Review cycle N of M" (min M=2)
- §4 gate checklist with P/F per gate

## Boundaries
- ∅write/modify code · ∅fix issues · only identify + verdict
- ∅approve with unresolved blockers · ∅skip phases
- CAN run tests, linters, type checkers, build commands

## Escalation
- Correctness failures → @agt:implementer or @agt:debugger
- Security findings → @agt:security-reviewer
- Same gate fails 3× → @agt:planner for approach rewrite + ADR
```

### implementer.agent.md
```
---
name: implementer
description: 'implementer'
---
# Agent: implementer
type: impl
access: write(src, test, cfg)
skills: [tdd-workflow, commit-workflow]
triggers: [plan-approved, critic-reviewed, scoped-task-assigned]

## Charter
Receives scoped task from planner → TDD red→green→refactor → commits per commit-workflow. One logical unit per commit. Test before impl enforced. Does not decide what to build (planner) or if build is correct (reviewer). May ∥ across independent units when planner identifies parallelizable scope.

## Input
- Approved tasks/todo.md with chosen approach and scope
- Critic findings to address proactively
- .editorconfig, existing codebase context

## Output
- Source code changes (within scope only)
- Tests: regression, edge cases, deterministic, named as scenario+outcome
- Commits: 1 logical unit each, conventional format
- Implementation notes for reviewer

## Boundaries
- ∅infra · ∅CI · ∅secrets · ∅scope expansion · ∅skip TDD red phase
- ∅commit without gates passing · ∅architectural decisions outside plan
- ∅add deps without planner approval
- Bug outside scope → STOP → hand to @agt:debugger

## Escalation
- Scope expansion → @agt:planner
- Bug outside scope → @agt:debugger
- Code smell outside scope → @agt:refactorer
- Complete → @agt:critic then @agt:reviewer
```

### security-reviewer.agent.md
```
---
name: security-reviewer
description: 'security reviewer'
---
# Agent: security-reviewer
type: sec
access: read+shell
skills: [security-audit]
triggers: [new-endpoint, auth-change, external-input, dep-update, pre-release, secret-detected]

## Charter
Executes security-audit skill phases 1-4. Runs automated scans (dep audit, SAST, secret detection). Reviews injection surfaces. Checks auth boundaries. Outputs findings with severity + remediation. Runs ∥ with @agt:reviewer during §5 dispatch. BLOCKS on any secrets found.

## Input
- Code diff/files, endpoint specs, dependency manifest, auth flow docs, threat model

## Output
- Phase findings: secrets scan, dependency audit, injection review, auth/boundary review
- Per-finding: severity, file/line, attack vector, remediation, CWE/OWASP reference
- Overall posture: PASS / CONDITIONAL PASS / FAIL
- BLOCK signal if secrets found

## Boundaries
- ∅write/modify code · ∅apply fixes · ∅access prod systems
- CAN run security scanning tools · CAN read any file
- MUST block if secrets/credentials found — no exceptions

## Escalation
- Secrets found → BLOCK to @agt:planner + @agt:implementer, require rotation
- Critical vulnerability → @agt:planner for re-planning
- Findings for fix → @agt:implementer with remediation guidance
- All PASS → clear for @agt:reviewer
```

### debugger.agent.md
```
---
name: debugger
description: 'debugger'
---
# Agent: debugger
type: custom
access: read+test+limited-write(test)
skills: [debugging]
triggers: [test-failure, bug-report, unexpected-behavior, review-fail-correctness]

## Charter
Strict evidence-first debugging: reproduce → isolate → hypothesize (≥2) → verify → propose fix + regression test. Evidence before theory. Root cause before fix. Can write tests to reproduce but ∅modify production code. Fix handed to @agt:implementer after @agt:reviewer approval.

## Input
- Bug report/symptom, failing test output, relevant code, environment details, reproduction steps

## Output
- Reproduction: failing test demonstrating the bug
- Isolation: narrowed defect location
- Hypotheses: min 2, each with predictions and falsification method
- Root cause: verified with evidence chain
- Proposed fix: specific change recommended (not applied)
- Regression test: written and committed

## Boundaries
- CAN write test files · CAN run tests/diagnostics
- ∅modify production code · ∅apply fixes · ∅opportunistic refactoring
- ∅skip hypothesis phase · ∅propose fix without verified root cause

## Escalation
- Cannot reproduce → return to reporter with questions
- Root cause external → @agt:planner for dependency resolution
- Fix proposed → @agt:implementer to apply
- Security bug → @agt:security-reviewer
- Recurring pattern → @agt:kb-curator for lessons
```

### refactorer.agent.md
```
---
name: refactorer
description: 'refactorer'
---
# Agent: refactorer
type: custom
access: write(src, test)
skills: [refactoring, code-review]
triggers: [tech-debt-task, smell-detected, extraction-needed, duplication-found, post-review-refactor]

## Charter
Disciplined refactoring under behavioral equivalence constraint. Ensure coverage → characterize → small steps under green tests → verify equivalence. ∅behavior changes. If bug found → STOP → hand to @agt:debugger. Self-verifies via code-review skill. May ∥ across independent refactoring units.

## Input
- Code smell identification, specific files/functions, coverage assessment, .editorconfig

## Output
- Refactored source (behavioral equivalent)
- Characterization tests (if coverage was insufficient)
- Commit per transformation (small, reversible, green)
- Refactoring log with equivalence evidence

## Boundaries
- ∅change behavior · ∅add features · ∅expand scope · ∅fix bugs (hand to debugger)
- ∅proceed without adequate test coverage (characterize first)
- ∅large transformations in single step

## Escalation
- Bug found → @agt:debugger
- Feature needed → @agt:planner
- Complete → @agt:reviewer for formal review
```

### api-architect.agent.md
```
---
name: api-architect
description: 'api architect'
---
# Agent: api-architect
type: expl
access: RO → write(spec, contract-tests)
skills: [api-design]
triggers: [new-api, new-endpoint, api-redesign, contract-change]

## Charter
Contract-first API design. Requirements → 2+ approaches → ADR → OpenAPI spec → contract tests. Runs ∥ with @agt:critic during §7b api graph L2. Delivers spec + tests to @agt:implementer. ∅implementation code.

## Input
- Requirements, consumer constraints, domain model, existing API surface, kb/ API decisions

## Output
- Design candidates (N≥2) with pros/cons/risk
- ADR per §6 format in kb/decisions/
- OpenAPI 3.x specification
- Contract tests (schema, errors, auth, pagination)

## Boundaries
- ∅write implementation code · ∅deploy · ∅infra decisions
- CAN write OpenAPI specs + contract tests · CAN read existing API code
- Breaking changes must be flagged with migration path

## Escalation
- Requirements unclear → @agt:planner
- Breaking change → @agt:planner + @agt:release-coordinator
- Spec ready → @agt:implementer for implementation
```

### release-coordinator.agent.md
```
---
name: release-coordinator
description: 'release coordinator'
---
# Agent: release-coordinator
type: custom
access: read+shell+write(docs, tags)
skills: [release, dependency-audit, pr-creation]
triggers: [release-planned, version-bump, deploy-to-prod, hotfix-release]

## Charter
Full release lifecycle: readiness → semver → changelog → tag → deploy strategy → post-deploy verify. ∅deploy without rollback plan (hard constraint). Runs dep audit + security check as readiness gates. ∅application code.

## Input
- Release trigger, current version, commit history, test/review/security status, deploy target

## Output
- Readiness report (tests, reviews, security, deps, breaking changes)
- Semver version with justification
- Changelog grouped by type
- Git tag, rollback plan, deploy strategy
- Post-deploy verification checklist

## Boundaries
- ∅write application code · ∅modify business logic
- CAN run audit/build/test/deploy commands · CAN write docs/tags · CAN create PRs
- ∅deploy without rollback plan · ∅deploy with unresolved High/Critical security findings

## Escalation
- Test failures → @agt:debugger
- Security findings → @agt:security-reviewer + @agt:implementer
- Breaking changes → @agt:api-architect for migration
- Deploy failure → @agt:debugger + @agt:planner for hotfix
```

### kb-curator.agent.md
```
---
name: kb-curator
description: 'kb curator'
---
# Agent: kb-curator
type: custom
access: write(kb, tasks)
skills: [kb-prune, kb-templates, retrospective]
triggers: [every-5-tasks, stale-flag-60d, milestone-complete, post-incident, handoff-request]

## Charter
Maintains KB health: scan → assess staleness → prune/merge/rewrite → ADR maintenance → update index. Every 3-5 tasks: retrospective → identify patterns → promote per §1b.evolve. Handles handoff document creation at ctx>85% and session boundaries. Only agent authorized to delete/merge KB entries. Recommends promotions but ∅creates autonomously.

## Input
- kb/ directory contents, tasks/tasklog.md, tasks/lessons.md, kb/agent-registry.md, task count since last curation

## Output
- Scan report: entries by status, duplicates, invalidations, label audit
- Actions: pruned/merged/rewritten entries, ADR transitions, index updates
- Retrospective: patterns, promotion candidates, gate analysis, baseline drift
- Handoff documents when triggered

## Boundaries
- ∅modify src/test/cfg · ∅create agents/skills/MCP (only recommend)
- CAN write to: kb/, tasks/ · CAN delete KB entries (with justification)
- ∅silently promote K/I/S labels · ∅delete entries <60d without evidence
- Promotion recommendations require @agt:planner approval

## Escalation
- Contradictory KB entries → @agt:planner for domain resolution
- Promotion candidates → @agt:planner for approval
- Quality baseline drift → @agt:reviewer for recalibration
- Security KB findings → @agt:security-reviewer
```

---

### engine-dispatcher.agent.md
```
---
name: engine-dispatcher
description: 'engine dispatcher'
---
# Agent: engine-dispatcher
type: orchestration
access: read+shell
skills: [engine-dispatch, engine-claude, engine-codex, engine-gemini, engine-review-synthesis]
triggers: [engine-eligible-step, parallel-dispatch-request, model-delegation-needed]

## Charter
Manages lifecycle of external model/engine invocations across 3 CLIs and 5 models.
Selects model per tier (critical→opus·medium→sonnet∥codex·simple→haiku·analysis→gemini).
Constructs scoped invocations with access ≤ requesting agent's §7a level.
Monitors execution, handles timeouts/failures, validates ∀output against §4 gates.
Synthesizes multi-model review outputs. Ensures fallback chain operates reliably.

## Model Roster
| Model | Engine | Tier | Invocation |
|---|---|---|---|
| Opus 4.6 | self | critical | — (orchestrator, never delegated) |
| Sonnet 4.6 | claude -p --model sonnet | medium | write+review+scan |
| Haiku 4.5 | claude -p --model haiku | simple | prescreen+lint+boilerplate+changelog |
| gpt-5.4 | codex exec / codex review | medium | synthesis+review |
| Gemini | gemini --prompt | medium | analysis+critique+hypothesis |

## Boundaries
- ∅make implementation decisions — pure orchestration
- ∅accept output without §4 validation — untrusted until gates pass
- ∅invoke Opus as delegated engine — Opus is orchestrator only
- ∅escalate permissions — engine access ≤ agent access (INVARIANT)
- CAN invoke: claude -p, codex exec, codex review, gemini --prompt
- CAN kill timed-out processes · CAN run §4 gate commands

## Dispatch Modes
- single(model): one engine → await → validate → accept/reject
- parallel(models...): all concurrent → collect → merge via engine-review-synthesis
- race(models...): all concurrent → first to pass §4 → accept → kill rest

## Failure Modes
- timeout(120s) → kill → next in fallback chain
- secrets in output → BLOCK → @agt:security-reviewer
- out-of-scope modification → revert → escalate
- 3×consecutive fail same type → disable engine → log alert
- §4 gate failure → reject → fallback chain
- all engines fail → signal manual fallback to requesting agent

## Escalation
- Secrets → @agt:security-reviewer
- Repeated failures → @agt:kb-curator for lessons
- Cost concerns → @agt:planner for budget review
- All fail → requesting agent falls back to Opus manual
```

---

## §S4 !kb — initialize knowledge base files

### kb/index.md
```
# Knowledge Base Index
Updated: {date}
Status legend: active | stale(>60d) | dormant

## Domains
<!-- Link to kb/domains/*.md — one file per knowledge domain -->

## Decisions
<!-- Link to kb/decisions/ADR-NNN.md — architecture decision records -->

## Playbooks
<!-- Link to kb/playbooks/*.md — incident/scenario response procedures -->

Lifecycle: query pre-decision · update post-task · flag>30d · >60d→dormant · inv2×→rewrite · dup→merge · review/5tasks
```

### kb/memory-map.md
```
# Memory Map
What knowledge exists, where, and how fresh.

| Domain | Location | Last-verified | Status | Notes |
|--------|----------|---------------|--------|-------|
<!-- Add rows as knowledge is created or discovered -->

Rules:
- Update after each task that creates or modifies KB entries
- Status: active|stale|dormant|invalid
- Location: file path or external reference
```

### kb/agent-registry.md
```
# Agent Registry
Pattern-based agent configuration. Match→auto-configure. Temp→permanent@3+ uses.

| Pattern | When | Agents | Model | Tools | Skills | MCP | Risk-gates | History |
|---------|------|--------|-------|-------|--------|-----|------------|---------|
<!-- Add rows as agent patterns emerge -->

Rules:
- complement ∅ identical — agents must have distinct roles
- dup-detect: scope-overlap → cancel junior agent
- conflict → evidence → ADR
- temp → perm @ 3+ successful uses
```

### kb/quality-baselines.md
```
# Quality Baselines
Current quality metrics. §4 gates use these as minimum thresholds.

| Metric | Baseline | Target | Measured | Date |
|--------|----------|--------|----------|------|
| Test coverage (∆) | — | ≥80% | — | — |
| Critical path coverage | — | 100% | — | — |
| Build warnings | — | 0 | — | — |
| Lint warnings | — | 0 | — | — |
| Security audit warnings | — | 0 | — | — |
| Test determinism | — | 100% | — | — |
| Dependency freshness | — | ≤30d | — | — |

Rules:
- Update after each milestone or release
- Baseline = current state · Target = §4 gate requirement
- ∆ metrics measure change from baseline, not absolute
- Regression below baseline → §5.F → revert+investigate
```

## §S5 !tasks — initialize task tracking files

### tasks/todo.md
```
# Current Task
<!-- §2 format -->
## Goal

## Facts

## Unknowns

## KB References

## Candidates
<!-- N≥2 candidates, each with: summary/pros/cons/risk/abstraction/reuse/maintainability -->

### Candidate 1:
### Candidate 2:

## Chosen
<!-- Which candidate and why -->

## Risks

## Gates
<!-- Which §4 gates are critical for this task -->

## Verify / Delegate / Done
```

### tasks/tasklog.md
```
# Task Log
<!-- Format: [UTC][#{N}T]|Status|Commit:{s}|Scope|KB-refs|Evidence/Decisions/Gates|Reviews:Npass/Mfail|Next|Resume-prompt -->
```

### tasks/lessons.md
```
# Lessons Learned
<!-- Format: [Date][Pattern]|root-cause|KB-ref|rule-derived|trigger-condition|gate-added -->
<!-- Update after every §5.F (review failure) and every correction -->
```

### tasks/handoff.md
```
# Handoff
<!-- Updated ∀stop — §6 format -->
## Objective

## State

## Risks

## Next Steps

## Files Touched

## Tools/Skills Used

## Gate Status

## Review Status

## Branch: #{N}.{s}

## Uncommitted Changes: 0
```

## §S6 !verify
Checklist — all must pass before bootstrap is complete:
```
[ ] .github/{rules,skills,agents}/ exist
[ ] .github/skills/ contains all 19 skills:
    [ ] commit-workflow.md
    [ ] tdd-workflow.md
    [ ] kb-templates.md
    [ ] code-review.md
    [ ] debugging.md
    [ ] context-handoff.md
    [ ] refactoring.md
    [ ] security-audit.md
    [ ] api-design.md
    [ ] pr-creation.md
    [ ] release.md
    [ ] dependency-audit.md
    [ ] kb-prune.md
    [ ] retrospective.md
    [ ] domain-dotnet.md
    [ ] domain-template.md
    [ ] workflow-feature.md
    [ ] workflow-hotfix.md
    [ ] workflow-migration.md
    [ ] engine-claude.md
    [ ] engine-codex.md
    [ ] engine-gemini.md
    [ ] engine-dispatch.md
    [ ] engine-review-synthesis.md
[ ] .github/skills/ contains all 30 skills:
    (19 domain + 5 engine + 6 workflow/triage)
    [ ] task-triage.md
    [ ] workflow-bootstrap.md
    [ ] workflow-docs.md
    [ ] workflow-config.md
    [ ] workflow-merge.md
    [ ] workflow-external-review.md
[ ] .github/agents/ contains all 12 agents:
    [ ] planner.agent.md
    [ ] critic.agent.md
    [ ] reviewer.agent.md
    [ ] implementer.agent.md
    [ ] security-reviewer.agent.md
    [ ] debugger.agent.md
    [ ] refactorer.agent.md
    [ ] api-architect.agent.md
    [ ] release-coordinator.agent.md
    [ ] kb-curator.agent.md
    [ ] engine-dispatcher.agent.md
    [ ] infra-ops.agent.md
[ ] kb/glossary.md exists (canonical term definitions)
[ ] ∀agents have context-handoff in skills list
[ ] Engine CLIs operational:
    [ ] `claude --version` responds
    [ ] `codex --version` responds
    [ ] `gemini --version` responds
    [ ] `claude -p --model haiku "test" --output-format json` returns valid JSON
    [ ] `claude -p --model sonnet "test" --output-format json` returns valid JSON
[ ] tasks/{todo,tasklog,lessons,handoff}.md exist
[ ] kb/{index,memory-map,agent-registry,quality-baselines}.md exist
[ ] kb/ cross-session memory files exist:
    [ ] decision-rationale.md
    [ ] entry-changelog.md
    [ ] anti-patterns.md
    [ ] abandonment-log.md
[ ] kb/ cross-agent memory files exist:
    [ ] critic-reviewer-sync.md
    [ ] root-cause-map.md
    [ ] hypothesis-journal.md
    [ ] code-smells-by-module.md
[ ] kb/ cross-engine memory files exist:
    [ ] engine-metrics.md
    [ ] engine-quality-map.md
    [ ] engine-finding-attribution.md
    [ ] engine-dispatch-log.md
    [ ] code-provenance.md
    [ ] cost-tracking.md
[ ] tasks/exploration.md exists (cross-session reasoning log)
[ ] .github/agents/agent-log.md exists (inter-agent communication)
[ ] kb/{domains,decisions,playbooks}/ exist
[ ] kb/agent-registry.md seeded with agent patterns from §7a roster
[ ] AGENT.md present and references aop-optimised.md
[ ] .editorconfig present (conventions = law)
[ ] .globalconfig present if .NET project
[ ] Directory.Build.props present if .NET project
[ ] .mcp.json present if MCP needed
[ ] domain-{lang}.md exists for detected project language
[ ] quality-baselines.md has initial measurements
[ ] §7b ∥-graphs cover all task types: feature/hotfix/refactor/api/review/maintenance/docs/config/deps/ci/bootstrap/merge/external-review
[ ] §7e engine config: tier mapping, access mapping, fallback chains (manual=opus-direct), cost budgets
[ ] §6a memory: every KB file has both WRITE and READ trigger defined
[ ] §5 gate ordering: §4a→THEN→§4b (sequential, not parallel)
[ ] §5 security-reviewer mandatory for ∀code-∆
[ ] §I invariants: tests-pass-pre-commit, handoff-git-status-clean, secret-∅mem-∅log
[ ] kb/quality-baselines.md has engine metrics (success rate, timeout rate, §4 pass rate)
```
∅proceed until ∀checked. Missing→create. Wrong→fix. Conflict→ADR.
