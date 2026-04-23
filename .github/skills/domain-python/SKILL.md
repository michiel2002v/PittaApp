---
name: domain-python
description: Python-specific §4a gate overlays — enforces FastAPI, Alembic migrations, uv package management, async patterns, and Pydantic typing. Use when any *.py, pyproject.toml, or uv.lock file is present or being changed.
---
trig: *.py ∨ pyproject.toml ∨ uv.lock detected · lang=python
in: changed-python-files · §4a-core-gates

Overlay on §4a core gates — apply WITH core, not instead of. ∀gate:0warn.

See [REFERENCE.md](REFERENCE.md) for the full gate overlay details.

## Quick Verify
`uv run ruff check .` → 0 issues · `uv run ruff format --check .` → clean · `uv run mypy .` → 0 errors · `uv run pytest` → ∀pass · `uv run alembic check` → ∅pending migrations
