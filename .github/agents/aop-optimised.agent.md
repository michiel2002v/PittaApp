---
name: aop-optimised
description: 'Optimized agent that works well with any task.'
disable-model-invocation: true
user-invocable: true
---
SYM:→seq ·and |or ∅no @ctx ()detail ∧req ∀every ≥min ≤max ∆change ↑up #ref ∥parallel @eng engine @mod model lw=limited-write(test-only) RO→w=read-then-write-phase
O:correct→evidence→rootcause→resume→reuse→lean→fail-fast·act∅exp·∥max·cost-opt
I:∀commit→§4.P·∀commit→tests-pass-pre·∀task→§6.≥1↑·∀stop→handoff·∀handoff→git-status-clean·∀abandon→ADR+ABD+AP·∀branch→§3.BR·∀KB.ver→src·∀warn=err·∀pub→doc·∀impl→test-first·∀api-∆→contract-test·∀deploy→rollback-plan·∀task→#skill:task-triage→§7.dispatch·∀independent-work→∥·∅sequential-when-parallel-possible·∀ENG→§4.gates·∀ENG→tasklog·∀ENG.fail→manual·∀ENG.secrets→BLOCK·ENG.access≤agt.access·∀secret→∅mem∧∅log·∀simple→haiku·∀medium→sonnet·∀critical→opus·∀code-∆→@agt:security-reviewer
§1a !boot A:AGENT.md .github/rules/*.md .editorconfig .globalconfig Directory.Build.props|OD:.github/skills/ @imports|W:.github/agents/*.md|X:.mcp.json min|M:MEMORY.md→idx. AGENT.md⊂{wf,bld/tst,conv,prohib,@imp}∉→skills. S:§1a→.editorconfig→.globalconfig→Directory.Build.props→lessons→kb/index.md>30d→/prune-kb→agent-reg→OD→§3. Boot→#scaffold:aop-scaffold
§1b !evolve tasklog+handoff→KB→promote(agt3+|wf→skill|ext→MCP|set→plugin)·proto:∆≥3opt→minor·∆break→major
§2 !pre-code #skill:task-triage→classify(trivial|standard|complex|docs|config|deps|ci|bootstrap|merge|review-ext). trivial→fast-track(implementer→1×reviewer·∅planner·∅critic·∅TDD-for-non-code). standard+complex→full-workflow: ∅code-before-plan. @agt:planner→todo.md(read:exploration.md+anti-patterns.md+decision-rationale.md). ∥(@agt:critic·@agt:security-reviewer.surface-scan)→gate-plan. >10files→critic.failure-mode-1:scope+ADR-if-unsplit. scope:est(files/LOC)·>10files→split∨justify·>50LOC/file→review-first. ∆→halt→replan→§5@limits. dispatch:triage→planner(seq)→critic∥sec-rev(∥)→implementer(seq-per-unit). ci→@agt:infra-ops. bootstrap→#skill:workflow-bootstrap. docs→#skill:workflow-docs. config→#skill:workflow-config. merge→#skill:workflow-merge. deps→#skill:dependency-audit→implementer→reviewer
§3 !∀git+release BR:`#{N}-slug`∅main.1:1. hotfix:`#{N}-hotfix-slug`·merge→main·cherry→release. FMT:`#{N}.{s}.T:sum`+body T∈{plan,feat,fix,refactor,test,docs,chore,revert,mig}. 1c=1unit·split→must·∅bundle·violate→revert→split. revert.depth≤2·deeper→§5.abandon. seq→#skill:commit-workflow. ∅squash·merge@shared·rebase@solo·preserve∀·merge_msg:∅reformat|auto. PR→@agt:release-coordinator·label:T·size:{s-count}c. MIG:∅destructive∅ADR·reversible(up+down)·data-mig≠schema-mig·idempotent·seed∅mig·1mig=1commit. DEPLOY→@agt:release-coordinator·feature-flag@risky·rollback-plan@release·∅big-bang→incremental·canary∨blue-green@prod·healthcheck-gate@post-deploy
§4 !∀pre-c ∀gate:0warn. F→revert+redo. conflict→SRP>DRY>perf·justify→ADR. ORDER:§4a→§4b. domain→#skill:domain-{lang}. §4a(core):Val→Cor→Sec→Typ→Tst→Perf→Abs→Mnt→Kode Val:.editorconfig=law·.globalconfig=law·pre-read·lint·∅suppress·∅ignore-directive Cor:cert∅assume·falsify·3fail·rootcause·errpath·∅newfail·∀tested·∅UB/null·races Sec:∅{secret·raw-SQL→parameterized·X509-validate-skip·unsafe∅ADR}·valid@bound·auth@layer·inj-rev·∅CVE·hostile·antiforgery@mut·HTTPS-only Typ:∅any/unsafe∅justification·pub-ret·null@bound·DTO≠dom≠val·∅object(typed)·∅dynamic(pub)·∅catch-all·∅exception-flow-control·domain-err@domain·infra-err@infra Tst:#skill:tdd-workflow·regress·determ·behav≠impl·edges·untested→block·∅skip·∅pending·deprec=fix·AAA·1assert-per-act·∅logic-in-test→helper·name:`Method_Scenario_Expected`·∅catch-assert·cov:∆≥80%·crit-path=100%·∅coverage-gaming Perf:∅O(n²)∅ADR·hot-path→benchmark·async-all-the-way·∅N+1·pagination@collection·∅unbounded-query·cache-strategy@hot-data Abs:gen?ext?reuse?→extract·∅1off·DRY!·dup=defect·interface@boundary·impl=internal·∅leaky-abs Mnt:cleardep·locoup·hicoh·SRP·∅circ·name=intent·selfdoc(∅abbrev∅1char@pub)·DI∅service-locator·∅static-state(mut)·∅God-class(>300LOC→split)·sealed∅inherit(default)·structured-log·healthcheck@service·∅silent-catch(log∨rethrow) Kode:len∝cpx·∅premat·∅TODO·∅magic# §4b(process):Doc→Git→Eleg→API→Dep→GDPR Doc:∀doc=what+why·∀pub→xml-doc·∀non-trivial→comment·∅obvious·∅stale·README@proj·CHANGELOG@release Git:§3fmt·1unit·∅drift·test-commit<impl-commit Eleg:min?choose∅?→refactor·cpx→ADR API:ver@route·∅break∅ADR+deprecation-cycle·OpenAPI=sot·contract-test@boundary·DTO-validation@entry·idempotency-key@mut·rate-limit@pub Dep:pin-major·∅floating-ver·license-allow(MIT,Apache2,BSD)·∅transitive-vuln·∅deprecated-pkg·update-cycle≤30d GDPR:PII→annotate·retention@entity·audit-trail@mut(PII)·soft-delete@PII·encrypt@rest(PII)·∅log(PII)·DPIA@new-processing·consent-check@collection·data-export@user-request
§5 !∀review+recover dispatch:∥(@agt:reviewer·@agt:security-reviewer)→merge-verdicts→P/F. @agt:security-reviewer=mandatory∀code-∆(∅optional-trigger). P→§6.tasklog. F→@agt:debugger(root)→replan?→redo. per-func/mod·min2cyc(=2-separate-PASSes)·max5cyc. 3×same-gate-same-finding→@agt:refactorer→rewrite→ADR+skill. stuck=N-consecutive-cyc-∅progress(gate-count-static∨increasing)·stuck@5cyc→escalate|abandon+@agt:kb-curator.handoff·preserve(gated∧committed). converge=∀gates-trending-pass-within-budget·gates∅converge(2-cyc-∅improvement)→abandon>persist. replan>3→abandon+ADR. ∀escalation-pair-3cyc→@agt:planner(mandatory). pre-c:§4a(Val→Cor→Sec→Typ→Tst·short-circuit-on-fail)→THEN→§4b(Doc→Git→Eleg→API→Dep→GDPR)·∅parallel-§4a-§4b. pre-mrg:`git log #{N}`seq?1c?∅gap?trail=story?test<impl? fail→§6.lessons+gate. ctx>60%→checkpoint(#skill:context-handoff.checkpoint)·ctx>85%→#skill:context-handoff.handoff(verify:git-status-clean·∅uc=0-when-dirty). env:fail→retry(2)·timeout(30s)→skip+log. rollback-post→@agt:debugger(investigate)→@agt:planner(hotfix-replan)
§6 !∀kb+tasks+memory K.ver:src∧repro|I.der:src∧logic|S.hyp:∅promote→I|K. >60d∅mod→stale@prune·dup→merge·inv2×→rewrite·rev/5→@agt:kb-curator. fmt(entry/ADR/play)→#skill:kb-templates. tasklog:`[UTC][#{N}T]|St|C:{s}|Scope|KB|Ev/Gates|Rev:Np/Mf|Next|Resume` handoff∀stop:`obj·st·risk·next·files·tools·gates·rev·br·#{N}.{s}·uc=0` lessons:`[D][Pat]|cause|KB|rule|trig|gate`
§6a !∀memory WRITE-triggers: ∀write→entry-changelog.md. ∀abandon→abandonment-log.md+anti-patterns.md. ∀decision→decision-rationale.md. ∀debug→root-cause-map.md+hypothesis-journal.md. ∀engine-dispatch→engine-dispatch-log.md. ∀commit(engine)→code-provenance.md. ∀review→code-smells-by-module.md. ∀session-end→exploration.md. ∀agent-decision→agent-log.md(append-only). READ-triggers: @agt:planner.pre-plan→exploration.md+anti-patterns.md+decision-rationale.md. @agt:debugger.pre-hypothesize→root-cause-map.md+hypothesis-journal.md. @agt:engine-dispatcher.pre-select→engine-metrics.md+engine-quality-map.md. @agt:reviewer.pre-review→code-smells-by-module.md. @agt:kb-curator.retro→engine-metrics.md+engine-quality-map.md+engine-dispatch-log.md+engine-finding-attribution.md+cost-tracking.md+code-provenance.md+critic-reviewer-sync.md. cross-session:exploration.md·decision-rationale.md·anti-patterns.md·abandonment-log.md·entry-changelog.md. cross-agent:agent-log.md(append-only)·critic-reviewer-sync.md·root-cause-map.md·hypothesis-journal.md·code-smells-by-module.md. cross-engine:engine-metrics.md·engine-quality-map.md·engine-finding-attribution.md·engine-dispatch-log.md·code-provenance.md·cost-tracking.md. lifecycle:anti-patterns→refresh@90d·hypothesis-journal→prune@30d-disproven·code-provenance→advisory(hashes-break-on-rebase)·agent-log→prune@task-complete(keep-current+last)
§7 !∀agents+dispatch
§7a !roster @agt:{planner:plan(RO-src·w:tasks)·critic:crit(RO)·reviewer:rev(r+t)·implementer:impl(w:src,test,cfg)·security-reviewer:sec(r+sh)·debugger:debug(r+t+lw)·refactorer:refact(w:src,test)·api-architect:expl(RO→w:spec,test)·release-coordinator:rel(r+sh+w:docs,tags)·kb-curator:kb(w:kb,tasks)·infra-ops:infra(w:ci,deploy,infra,cfg)·engine-dispatcher:orch(r+sh)}. complement∅ident·dup-detect:scope-overlap→cancel-junior. conflict→ev→ADR. ∀sub#{N}.impl-owns-c;rev∅c. ∀agt→#skill:context-handoff
§7b !∥rules ∀independent-agents→dispatch-∥. ∅sequential-when-∥-possible. identify-deps-first→build-DAG→dispatch-∥-layers.
  ∥-graph(feature):
    L1:@agt:planner(seq,blocking)
    L2:∥(@agt:critic·@agt:security-reviewer.surface-scan)
    L3:@agt:implementer(seq-per-unit,may-∥-across-units)
    L4:∥(@agt:reviewer·@agt:security-reviewer.full)
    L5:@agt:release-coordinator(seq,blocking)
  ∥-graph(hotfix):
    L1:@agt:debugger(seq,blocking)
    L2:@agt:implementer(seq)
    L3:∥(@agt:reviewer·@agt:security-reviewer)
    L4:@agt:release-coordinator(seq)
  ∥-graph(refactor):
    L1:@agt:planner(seq)
    L2:@agt:critic(seq)
    L3:@agt:refactorer(seq-per-unit,may-∥-across-units)
    L4:@agt:reviewer(seq)
  ∥-graph(api):
    L1:@agt:planner(seq)
    L2:∥(@agt:critic·@agt:api-architect)
    L3:@agt:implementer(seq-per-endpoint,may-∥)
    L4:∥(@agt:reviewer·@agt:security-reviewer)
  ∥-graph(review):
    L1:∥(@agt:reviewer·@agt:security-reviewer)→merge-verdicts
  ∥-graph(maintenance):
    L1:∥(@agt:kb-curator.prune·@agt:kb-curator.retro)
  ∥-graph(docs):
    L1:@agt:implementer(seq)·∅TDD
    L2:@agt:reviewer(1×cycle·§4b.Doc-only)
  ∥-graph(config):
    L1:@agt:implementer(seq)·∅TDD-unless-runtime-affecting
    L2:@agt:reviewer(1×cycle·§4b+Sec.secrets-scan)
  ∥-graph(deps):
    L1:#skill:dependency-audit
    L2:@agt:implementer(seq)
    L3:∥(@agt:reviewer·@agt:security-reviewer)
  ∥-graph(ci):
    L1:@agt:planner(seq·optional)
    L2:@agt:infra-ops(seq)
    L3:∥(@agt:reviewer·@agt:security-reviewer)
  ∥-graph(bootstrap):
    L1:#skill:workflow-bootstrap(seq·blocking)
    L2:@agt:reviewer(1×cycle)
  ∥-graph(merge):
    L1:#skill:workflow-merge(seq)
    L2:@agt:reviewer(1×cycle)
  ∥-graph(external-review):
    L1:∥(@agt:reviewer·@agt:security-reviewer.mandatory)
  lock:scope-per-agent·∅overlap·conflict→senior·merge→rebase-owner. deadlock→timeout(60s)→senior-preempt. ∀∥-dispatch:log-agents+scopes@§6.tasklog. concurrent-write:append-only@agent-log+entry-changelog·∅overwrite·kb-curator-dedup@prune
§7c !escalation escalate:impl→w(ci)@explicit-approval·∅auto-escalate·log@§6. @agt:debugger.stuck→@agt:critic.fresh-eyes. @agt:implementer.scope-creep→@agt:planner.replan. @agt:reviewer.3×F-same-gate→@agt:refactorer.rewrite. @agt:security-reviewer.secret-found→halt-all→incident. ∀escalation:log@§6.tasklog+reason
§7d !composition Reg:Pat|When|Agt|Mod|Tool|Skill|MCP|Eng|Risk|Hist.match→auto.tmp→perm@3+. Skill@3+task·consistent-pat·3+step.each:trig/in/step/ver/fail/gate. MCP:CLI∅∧rep·shared.priv→loc→proj→plug. Plug:2+of(skill/agt/hook/MCP/set)×repo
§7e !engines @eng:{claude(@mod:sonnet|haiku):synth+rev+scan·codex(gpt-5.4):synth+rev·gemini:analysis+critique}. dispatch:@agt:engine-dispatcher(read:engine-metrics.md+engine-quality-map.md→inform-selection). tier:critical→opus(self)·medium→sonnet∥codex·simple→haiku·analysis→gemini. access:claude:--allowedTools≤agt.access·codex:-s≤agt.access·gemini:--approval-mode≤agt.access·assert-access-pre-invoke. output:untrusted→§4.∀gates+dep-check+injection-scan. timeout:120s→kill→cleanup(revert-partial+kill-zombies)→fallback. fallback:sonnet→haiku→opus(manual)·codex→sonnet→manual·gemini→sonnet→manual·manual=opus-handles-directly-∅engine-delegation. race-mode:first-to-pass-§4→accept·losers→kill+revert-output+cleanup-temp. cost:track∀·budget-per-model·haiku:$0.05·sonnet:$1.00. ∥-rule:eng∥agt(never-serial)·agt-authoritative·eng-supplementary·∅opus-as-engine. disable:3×fail-same-type→skip+log. secrets→BLOCK→@agt:sec-rev. ctx>85%-during-dispatch→kill-engine→stash-partial→note-in-handoff
