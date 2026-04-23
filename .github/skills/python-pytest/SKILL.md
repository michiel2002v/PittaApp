---
name: python-pytest
description: Best practices for pytest testing in Python, including async tests with pytest-asyncio, FastAPI integration tests with httpx.AsyncClient, fixture design, parametrize, and SQLAlchemy test database setup. Use when writing pytest tests, setting up conftest.py, testing FastAPI endpoints, mocking dependencies, or testing async code with pytest-asyncio.
---
trig: pytest·conftest·fixture·parametrize·pytest-asyncio·httpx·asyncclient·dependency_overrides·aiosqlite·mock·monkeypatch
in: python-test-code

# pytest Best Practices

Your goal is to help me write effective, deterministic pytest tests for Python 3 applications using FastAPI, SQLAlchemy, and async patterns.

## Project Setup

```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"          # all async test functions run automatically
testpaths = ["tests"]
addopts = "--cov --cov-fail-under=80 -q"

[tool.coverage.run]
source = ["src"]
omit = ["*/migrations/*", "*/alembic/*"]
```

Dependencies (add as dev):
```
uv add --dev pytest pytest-asyncio pytest-cov httpx anyio aiosqlite
```

## Test Structure

- Mirror `src/` layout under `tests/` — `tests/{domain}/test_router.py`, `tests/{domain}/test_service.py`
- `conftest.py` at `tests/` root for shared fixtures; domain-level `conftest.py` for domain fixtures
- Name tests: `test_<function>_<scenario>_<expected_outcome>`
  Examples: `test_create_item_valid_input_returns_201`, `test_get_item_not_found_returns_404`
- One assertion per logical behaviour — ∅testing multiple unrelated behaviours in one test
- Tests must be deterministic and order-independent (∅shared mutable state between tests)

## Fixtures

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from {package}.main import app
from {package}.database import get_db
from {package}.models import Base  # DeclarativeBase metadata

@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest.fixture
async def db_session(engine) -> AsyncSession:
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()  # isolate each test

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

## Integration Tests (FastAPI Router)

```python
# tests/{domain}/test_router.py
import pytest
from httpx import AsyncClient

async def test_create_item_valid_input_returns_201(client: AsyncClient):
    response = await client.post("/api/v1/items/", json={"name": "test item"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "test item"
    assert "id" in data

async def test_get_item_not_found_returns_404(client: AsyncClient):
    response = await client.get("/api/v1/items/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
```

## Unit Tests (Service Layer)

```python
# tests/{domain}/test_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from {package}.{domain}.service import ItemService
from {package}.{domain}.schemas import CreateRequest

async def test_create_item_calls_repository_with_correct_data():
    mock_repo = AsyncMock()
    mock_repo.create.return_value = MagicMock(id="uuid", name="test")
    service = ItemService(repo=mock_repo)

    result = await service.create(CreateRequest(name="test"))

    mock_repo.create.assert_called_once()
    assert result.name == "test"
```

## Parametrize

```python
import pytest

@pytest.mark.parametrize("name,expected_status", [
    ("valid name", 201),
    ("", 422),          # empty string fails validation
    ("x" * 300, 422),   # too long fails validation
])
async def test_create_item_name_validation(client, name, expected_status):
    response = await client.post("/api/v1/items/", json={"name": name})
    assert response.status_code == expected_status
```

## Mocking Dependencies

- Use `app.dependency_overrides[dep_fn] = replacement_fn` for FastAPI deps — ∅monkeypatching modules
- Use `unittest.mock.AsyncMock` for async callables
- Use `unittest.mock.patch` as context manager or decorator for module-level imports
- Always `clear()` overrides in fixture teardown (see client fixture above)

```python
from unittest.mock import patch, AsyncMock

async def test_with_mocked_external_service(client):
    with patch("{package}.{domain}.service.external_call", new_callable=AsyncMock) as m:
        m.return_value = {"status": "ok"}
        response = await client.post("/api/v1/items/sync", json={})
    assert response.status_code == 200
    m.assert_awaited_once()
```

## Authentication in Tests

```python
from {package}.core.auth import get_current_user

@pytest.fixture
def auth_client(client, db_session):
    """Client with auth bypassed — inject a fake current user."""
    fake_user = FakeUser(id=uuid4(), role="user")
    app.dependency_overrides[get_current_user] = lambda: fake_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)
```

## Assertions and Error Cases

- Always assert both status code AND response body shape on success paths
- Always assert error `detail` content on failure paths — ∅assert status code only
- Use `pytest.raises` for unit-level exception testing:
  ```python
  with pytest.raises(ValueError, match="must be positive"):
      service.validate(-1)
  ```
- ∅`try/except` in tests to assert exceptions — use `pytest.raises`

## Coverage Rules

- ∅coverage gaming — ∅tests that call code without asserting outcomes
- Critical paths (auth checks, ownership checks, error handlers): 100% coverage required
- Target: `--cov-fail-under=80` for general coverage; raise per-module if security-sensitive

## Quick Verify

`uv run pytest` → ∀pass · `uv run pytest --cov --cov-fail-under=80` → passes · ∅`asyncio.run()` in tests · ∅`time.sleep` in tests · all async test files have `asyncio_mode = "auto"` or `@pytest.mark.asyncio`
