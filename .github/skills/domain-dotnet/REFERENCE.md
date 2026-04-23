# domain-dotnet Reference

Overlay on §4a core gates. Apply WITH core, not instead of. ∀gate:0warn.

## Val+
- `dotnet format --verify-no-changes`
- IDE+CA+SA: all analyzers enabled · TreatWarningsAsErrors=true · Nullable=enable
- ∅#pragma-warn-disable · ∅SuppressMessage(unreviewed) · ∅obsolete(self-authored)
- WarningLevel=9999 · AnalysisLevel=latest-All · EnforceCodeStyleInBuild=true

## Cor+
- build:0warn (TreatWarningsAsErrors enforces)

## Sec+
- HttpClient.new → IHttpClientFactory · ∅BinaryFormatter · ∅fixed∅ADR
- raw-SQL → parameterized ∨ EF-LINQ

## Typ+
- record∨sealed(DTO) · IAsyncDisposable @ async resources
- CancellationToken @ async public methods
- ∅sync-over-async (Task.Result/.Wait) → await
- Result<T> ∨ Exception — choose 1 per project, be consistent
- ProblemDetails @ API error responses
- ∅catch-all (∅empty-catch) · domain-err → domain exceptions · infra-err → infra exceptions

## Tst+
- ∅Thread.Sleep → Task.Delay · ∅DateTime.Now → TimeProvider
- xUnit IClassFixture/ICollectionFixture @ shared setup
- FluentAssertions ∨ Verify @ assertions
- ∅catch-assert — assert with Should().Throw

## Perf+
- ∅N+1 queries: EF → .Include() | split query | projection
- ∅Enumerable chains on DB → IQueryable (server-side eval)
- pool @ HttpClient (via IHttpClientFactory)

## Abs+
- ∅leaky-abs: EF/DbContext ∅leak into app/domain layer
- Vintecc.Mediator @ request handlers (IRequest<T>, IRequestHandler<TReq,TRes>)

## Mnt+
- Options-pattern @ config binding · ILogger<T> @ class-level logging
- ∅Console.Write → ILogger
- structured-log: ∅string-interpolation → message template
- correlationId @ request pipeline

## MIG+
- ∅EnsureCreated(prod) — migrations only · EF migrations preferred
- `dotnet ef migrations add` → review generated SQL

