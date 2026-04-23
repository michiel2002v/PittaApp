---
name: python-best-practices
description: Ensure Python code meets best practices for the solution/project. Use when reviewing or improving Python code quality, applying SOLID principles, setting up DI with FastAPI Depends(), configuring structlog logging, implementing error handling, or auditing async patterns and test structure.
---
trig: python-best-practices·python-review·python-quality·solid·di·dependency-injection·structlog·pydantic-settings
in: python-code·selection

# Python Best Practices

Your task is to ensure Python code meets best practices for this solution. Applies to FastAPI + SQLAlchemy + uv projects.

## Project Structure

Follow the mandatory layout from `#skill:domain-python Str+`:
```
src/{package}/
├── main.py          # app factory + lifespan + router includes
├── settings.py      # pydantic-settings BaseSettings (single source of truth)
├── database.py      # AsyncEngine + AsyncSessionLocal + get_db()
├── {domain}/        # router · service · repository · models · schemas
└── core/            # auth · exceptions · logging
```

- ∅business logic in `router.py` → `service.py`
- ∅DB access in `service.py` → `repository.py`
- ∅cross-layer imports (schemas ↔ models)
- ∅`from {package} import *` anywhere

## Settings and Configuration

```python
# src/{package}/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str
    secret_key: str
    debug: bool = False
    allowed_origins: list[str] = []

settings = Settings()  # module-level singleton — safe because it's immutable
```

- ALL config via `pydantic-settings` `BaseSettings` — ∅`os.environ` direct access in business code
- ∅hardcoded values for URLs, secrets, or environment-variant config
- `.env` gitignored; `.env.example` committed with placeholder values
- One `Settings` instance at module level in `settings.py` — import `settings` object, not `os.environ`

## Dependency Injection

- Use FastAPI `Depends()` for all I/O resources exposed to request handlers
- ∅module-level singletons for mutable or I/O resources (DB sessions, HTTP clients)
- Use `Annotated[T, Depends(fn)]` syntax (explicit, mypy-friendly):

```python
from typing import Annotated
from fastapi import Depends
from {package}.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

DbDep = Annotated[AsyncSession, Depends(get_db)]

@router.get("/items")
async def list_items(db: DbDep) -> list[ItemResponse]:
    ...
```

- Services can be injected as `Annotated[MyService, Depends()]` when FastAPI can construct them
- Use `app.dependency_overrides` in tests — never monkeypatch module globals

## Logging

```python
# src/{package}/core/logging.py
import structlog

def configure_logging(debug: bool = False) -> None:
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer() if not debug
            else structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            10 if debug else 20  # DEBUG if debug else INFO
        ),
    )

# Usage in any module
import structlog
logger = structlog.get_logger(__name__)

async def create_item(data: CreateRequest) -> ItemResponse:
    logger.info("creating_item", name=data.name)
    ...
```

- ∅`print()` in production code — always `logger.info/warning/error()`
- ∅string interpolation in log calls: `logger.info(f"user {id}")` → `logger.info("event", user_id=id)`
- ∅PII in log messages (names, emails, passwords, tokens)
- Bind request-scoped context (request_id, user_id) via `structlog.contextvars.bind_contextvars()`

## Error Handling

```python
# src/{package}/core/exceptions.py
from fastapi import Request
from fastapi.responses import JSONResponse

class DomainError(Exception):
    """Base for all domain-layer errors."""

class NotFoundError(DomainError):
    def __init__(self, resource: str, id: object) -> None:
        self.resource = resource
        self.id = id
        super().__init__(f"{resource} {id} not found")

class PermissionDeniedError(DomainError):
    pass

# Register in main.py:
@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={
        "type": "not_found",
        "title": "Resource not found",
        "detail": str(exc),
    })
```

- Domain errors raised from `service.py` — ∅`HTTPException` in service layer
- `HTTPException` only in `router.py` or exception handlers
- ∅bare `except:` or `except Exception: pass` — always log + re-raise or handle specifically
- ∅swallowing exceptions silently

## SOLID in Python

**Single Responsibility** — one class per concern: router (HTTP), service (business), repository (DB)

**Open/Closed** — extend via composition, not inheritance; use `Protocol` for interfaces:
```python
from typing import Protocol

class ItemRepositoryProtocol(Protocol):
    async def get_by_id(self, id: UUID) -> Item | None: ...
    async def create(self, item: Item) -> Item: ...
```

**Liskov** — subtypes must be substitutable; avoid overriding behaviour unexpectedly

**Interface Segregation** — small focused `Protocol` types over fat base classes

**Dependency Inversion** — depend on `Protocol` abstractions, not concrete `Repository` classes; inject via `Depends()`

## Type Annotations

- ALL public functions annotated — enforced by `mypy strict`
- ∅`Any` on public function signatures
- ∅`Optional[T]` → `T | None` (Python 3.10+)
- ∅`Union[X, Y]` → `X | Y`
- Use `TypeAlias` for complex repeated types: `UserId: TypeAlias = UUID`
- Use `TypeVar` + `Generic` for reusable typed containers

## Code Quality Rules

- Max function length: ~20 lines; extract named helpers for anything longer
- ∅magic numbers — name constants at module level: `MAX_ITEMS = 100`
- ∅mutable default arguments: `def f(items: list = [])` → `def f(items: list | None = None)`
- ∅`global` mutable state — use DI
- ∅late-binding closure bugs in loops: use `default=x` parameter to capture

## Async Hygiene

- All route handlers and service methods `async def` — see `#skill:python-async`
- ∅mixing sync blocking I/O with async functions
- ∅`asyncio.run()` inside a running event loop

## Testing

- Every module has a corresponding test file — see `#skill:python-pytest`
- Target: `--cov-fail-under=80`; auth checks and ownership checks: 100%
- ∅tests that call code without asserting outcomes

## Quick Verify

`uv run ruff check .` → 0 · `uv run ruff format --check .` → clean · `uv run mypy .` → 0 · `uv run pytest --cov --cov-fail-under=80` → pass · ∅`print()` in `src/` · ∅`os.environ` direct in business code · ∅bare `except:`
