# domain-python Reference

Overlay on §4a core gates. Apply WITH core, not instead of. ∀gate:0warn.

## Package Management (uv — mandatory)

- ALL dependency management via `uv` only — ∅pip ∅poetry ∅pipenv ∅conda direct
- Add deps: `uv add <package>` — updates `pyproject.toml` + `uv.lock`
- Dev deps: `uv add --dev <package>`
- Run scripts: `uv run <script>` — activates project venv automatically
- Sync: `uv sync` — install all deps from lockfile
- `uv.lock` MUST be committed to repository
- ∅floating versions in `pyproject.toml` — pin `>=major.minor,<next-major`
- ∅requirements.txt as source of truth; use `pyproject.toml` + `uv.lock`

## Val+
- `uv run ruff check .` → 0 issues (linting)
- `uv run ruff format --check .` → 0 formatting changes
- `uv run mypy .` → 0 errors (strict type checking)
- pyproject.toml: `[tool.mypy] strict = true` · `[tool.ruff] target-version = "py<min-version>"`
- ∅noqa suppressions without comment explaining why
- ∅type: ignore without comment

## Cor+
- ∅mutable default arguments (def f(x=[]) → def f(x=None))
- ∅bare `except:` → `except SpecificError:`
- ∅late binding closures in loops → use default parameter
- ∅global mutable state — use FastAPI dependency injection instead

## Sec+
- SQL → SQLAlchemy ORM or `text()` with `:named` params — ∅f-string SQL
- ∅`pickle` / `eval` / `exec` on untrusted input
- ∅hardcoded secrets — use `pydantic-settings` + env vars + Key Vault
- ∅`DEBUG=True` in production config
- ∅`cors_origins=["*"]` in production
- FastAPI: `Depends()` for auth on every protected route — ∅optional auth
- Pydantic: `model_config = ConfigDict(extra="forbid")` on request models (input hardening)
- ∅`Any` type on request/response Pydantic models (typed inputs/outputs only)

## Typ+
- ALL request/response models: Pydantic `BaseModel` — ∅dict, ∅Any
- Return types annotated on ALL functions (enforced by mypy strict)
- `Annotated[T, ...]` for Field metadata — ∅bare Field() without type
- Domain models ≠ Pydantic schemas — separate layers (schema → service → domain)
- Use `UUID` not `int` for public-facing IDs
- ∅`Optional[X]` → use `X | None` (Python 3.10+)
- ∅`Union[X, Y]` → `X | Y`
- Async functions: return type must be the awaitable result type, not coroutine

## Tst+
- Framework: `pytest` + `pytest-asyncio` + `httpx.AsyncClient` for FastAPI tests
- Async tests: `@pytest.mark.asyncio` or `asyncio_mode="auto"` in `pyproject.toml`
- FastAPI: use `app.dependency_overrides` for injecting test deps (db, auth)
- DB: use a test database or in-memory SQLite with Alembic migrations applied
- ∅`time.sleep` in tests → `anyio.sleep` or mock
- ∅global test state — use `pytest` fixtures with appropriate scope
- Coverage: `uv run pytest --cov --cov-fail-under=80`
- Name: `test_<function>_<scenario>_<expected_outcome>`

## API+ (FastAPI — mandatory)
- ALL web endpoints via FastAPI — ∅Flask ∅Django ∅Starlette direct
- Router organisation: `APIRouter` per domain module, included in main app
- Response models: explicit `response_model=` on every endpoint — ∅naked dict return
- Status codes: explicit `status_code=` — ∅rely on default 200 for mutations
- Path params: validated via Pydantic type annotations
- Error responses: `HTTPException` with structured detail; use `ProblemDetail` pattern for consistency
- `lifespan` context manager for startup/shutdown (∅deprecated `@app.on_event`)
- OpenAPI: `tags=`, `summary=`, `description=` on every router/endpoint (public API)
- Versioning: prefix routers with `/api/v{N}/`
- Rate limiting: apply `slowapi` or equivalent on public endpoints

## Perf+
- ALL FastAPI endpoints: `async def` — ∅sync def for I/O-bound handlers
- DB: use `AsyncSession` (SQLAlchemy async) — ∅sync Session in async context
- ∅N+1: use `.options(selectinload(...))` or `.joinedload(...)` explicitly
- Pagination on all collection endpoints: `limit` + `offset` or cursor-based
- Background tasks: `BackgroundTasks` or Celery/ARQ for long-running work — ∅blocking in request

## DB+ (SQLAlchemy + Alembic — mandatory)
- ALL migrations via Alembic — ∅`Base.metadata.create_all()` in production
- Migration command: `uv run alembic revision --autogenerate -m "description"`
- Apply: `uv run alembic upgrade head`
- Each migration MUST have `upgrade()` AND `downgrade()` implemented
- ∅destructive migration without ADR (DROP COLUMN, DROP TABLE, data loss)
- Data migrations ≠ schema migrations → separate files
- `uv run alembic check` gate in CI — fails if unapplied migrations exist
- ORM models: `DeclarativeBase` (SQLAlchemy 2.0 style) — ∅legacy `declarative_base()`
- ∅`session.execute(text("raw sql string"))` without named parameters

## Mnt+
- Settings: `pydantic-settings` `BaseSettings` with `.env` file support — ∅`os.environ` directly
- Logging: `structlog` or `logging` with JSON formatter — ∅`print()` in production code
- ∅`print()` → `logger.info()`
- Dependency injection: FastAPI `Depends()` — ∅module-level singletons for I/O resources
- `__all__` defined in public module `__init__.py`

## MIG+
- Alembic config in `alembic.ini` + `alembic/env.py`
- `env.py` must load `DATABASE_URL` from `pydantic-settings` — ∅hardcoded URLs
- `env.py` for async engines: use `run_async_migrations()` with `AsyncEngine` + `connection.run_sync(do_run_migrations)` — ∅sync engine in async project
- Autogenerate: `uv run alembic revision --autogenerate -m "<description>"`
- ∅`alembic stamp head` as substitute for running migrations
- CI gate: `uv run alembic check` must pass (0 pending migrations in test DB)

## Str+ (Project Structure — mandatory layout)

Standard FastAPI project layout. Agents MUST follow this structure:

```
src/
└── {package_name}/
    ├── main.py              # FastAPI app factory + lifespan + router includes
    ├── settings.py          # pydantic-settings BaseSettings (single source of truth)
    ├── database.py          # AsyncEngine + AsyncSessionLocal + get_db() dependency
    │
    ├── {domain}/            # one folder per bounded context / domain
    │   ├── __init__.py
    │   ├── models.py        # SQLAlchemy ORM models (DeclarativeBase)
    │   ├── schemas.py       # Pydantic request/response models
    │   ├── repository.py    # DB access only — no business logic
    │   ├── service.py       # Business logic only — calls repository, no HTTP
    │   └── router.py        # FastAPI APIRouter — calls service, no DB direct
    │
    └── core/
        ├── auth.py          # SSO / JWT dependency (get_current_user)
        ├── exceptions.py    # Custom exception types + exception handlers
        └── logging.py       # structlog configuration

alembic/
├── env.py                   # async-aware migration env
└── versions/                # migration files (autogenerated)

tests/
├── conftest.py              # pytest fixtures: app, async_client, test_db session
└── {domain}/
    ├── test_router.py       # integration tests via httpx.AsyncClient
    └── test_service.py      # unit tests with mocked repository
```

Rules:
- ∅business logic in `router.py` → belongs in `service.py`
- ∅DB access in `service.py` → belongs in `repository.py`
- ∅SQLAlchemy models imported into `schemas.py` (and vice versa) — keep layers separate
- ∅`from {package} import *` in any module

## Svc+ (Service / Repository Layer)

### Database session dependency (`database.py`)
```python
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from {package}.settings import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### Repository pattern (`{domain}/repository.py`)
```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from {package}.{domain}.models import MyModel

class MyRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, id: UUID) -> MyModel | None:
        result = await self._db.execute(select(MyModel).where(MyModel.id == id))
        return result.scalar_one_or_none()

    async def create(self, obj: MyModel) -> MyModel:
        self._db.add(obj)
        await self._db.flush()  # flush, not commit — session commits in get_db()
        return obj
```

### Service layer (`{domain}/service.py`)
```python
from {package}.{domain}.repository import MyRepository
from {package}.{domain}.schemas import CreateRequest, MyResponse

class MyService:
    def __init__(self, repo: MyRepository) -> None:
        self._repo = repo

    async def create(self, data: CreateRequest) -> MyResponse:
        # business logic here — no DB session, no HTTP
        ...
```

### Router wiring (`{domain}/router.py`)
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from {package}.core.auth import get_current_user
from {package}.database import get_db
from {package}.{domain}.repository import MyRepository
from {package}.{domain}.service import MyService
from {package}.{domain}.schemas import CreateRequest, MyResponse

router = APIRouter(prefix="/api/v1/my-domain", tags=["my-domain"])

def get_service(db: AsyncSession = Depends(get_db)) -> MyService:
    return MyService(MyRepository(db))

@router.post("/", response_model=MyResponse, status_code=201)
async def create_item(
    data: CreateRequest,
    service: MyService = Depends(get_service),
    current_user: CurrentUser = Depends(get_current_user),
) -> MyResponse:
    return await service.create(data)
```

Rules:
- ∅`Depends(get_db)` in `service.py` — only in `router.py` or dependency factory
- ∅`session.commit()` in `repository.py` — the `get_db()` context manager owns commit
- ∅raw SQL strings anywhere in service or router layer
- Ownership checks belong in `service.py` (`if obj.owner_id != current_user.id: raise`)

## Tst+ (Testing — async DB fixtures)

### `conftest.py` pattern for async tests with real DB
```python
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from {package}.main import app
from {package}.database import get_db
from {package}.core.base import Base  # DeclarativeBase subclass

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def anyio_backend() -> str:
    return "asyncio"

@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest.fixture()
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()

@pytest.fixture()
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
```

Rules:
- ∅`Base.metadata.create_all()` in production code — only in test fixtures and Alembic
- Use `app.dependency_overrides` to inject test DB — ∅monkeypatching module globals
- Each test gets a fresh `db_session` rolled back after — no test state bleeds
- Prefer `aiosqlite` for in-memory test DB; use real PostgreSQL for integration tests in CI
