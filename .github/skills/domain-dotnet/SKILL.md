---
name: domain-dotnet
description: .NET-specific §4a gate overlays for C# projects — adds dotnet format, nullable, async, EF Core, and logging rules on top of core gates. Use when any *.csproj, *.sln, or *.cs file is present or being changed.
---
trig: *.csproj ∨ *.sln ∨ *.cs detected · lang=dotnet
in: changed-.NET-files · §4a-core-gates

Overlay on §4a core gates — apply WITH core, not instead of. ∀gate:0warn.

See [REFERENCE.md](REFERENCE.md) for the full gate overlay details.

## Quick Verify
`dotnet build` → 0warn · `dotnet test` → ∀pass · `dotnet format --verify-no-changes` → clean

