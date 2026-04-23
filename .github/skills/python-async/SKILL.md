---
name: python-async
description: Best practices for Python async/await programming. Use when reviewing or writing async Python code, identifying async pitfalls (blocking calls in async context, missing await), choosing between async generators and iterators, handling cancellation, implementing async context managers, or working with asyncio/anyio.
---
trig: async·await·asyncio·anyio·asyncgenerator·asynccontextmanager·create_task·gather·taskgroup
in: python-code

# Python Async/Await Best Practices

Your goal is to help me follow best practices for asynchronous programming in Python 3.

## Core Rules

- `async def` for any function that contains `await` or `yield` with async context
- `await` every coroutine call — ∅calling coroutine without `await` (creates coroutine object, not result)
- ∅`asyncio.run()` inside an already-running event loop — use `await` directly
- ∅mixing sync blocking I/O with async code — see Blocking Calls section

## Return Types

- Annotate async functions with their return value type, not `Coroutine[...]`:
  `async def get_user(id: UUID) -> User | None:`
- Use `AsyncGenerator[YieldType, SendType]` for async generators
- Use `AsyncIterator[T]` for async iterator protocol implementations

## Blocking Calls in Async Code

Any sync blocking call inside `async def` blocks the entire event loop:

| Blocking (∅in async) | Async replacement |
|---|---|
| `time.sleep(n)` | `await asyncio.sleep(n)` |
| `open(path)` | `aiofiles.open(path)` |
| `requests.get(url)` | `httpx.AsyncClient().get(url)` |
| `subprocess.run(...)` | `asyncio.create_subprocess_exec(...)` |
| CPU-bound work | `await asyncio.get_event_loop().run_in_executor(None, fn)` |

- For CPU-bound tasks: use `run_in_executor` with a `ThreadPoolExecutor` or `ProcessPoolExecutor`
- ∅sync SQLAlchemy `Session` in async context — use `AsyncSession`

## Task Concurrency

- Run independent coroutines concurrently with `asyncio.gather()` or `asyncio.TaskGroup`:

```python
# Python 3.11+ — preferred: structured concurrency with TaskGroup
async with asyncio.TaskGroup() as tg:
    task_a = tg.create_task(fetch_a())
    task_b = tg.create_task(fetch_b())
# both done here; exceptions propagate cleanly

# Python 3.10 and below — asyncio.gather
results = await asyncio.gather(fetch_a(), fetch_b())
```

- ∅`asyncio.gather(*coros, return_exceptions=False)` where silent failure is unacceptable — handle each exception explicitly
- ∅fire-and-forget `asyncio.create_task()` without keeping a reference — store task references to prevent GC cancellation

## Cancellation

- Handle `asyncio.CancelledError` explicitly when cleanup is needed — always `raise` after cleanup:
```python
try:
    await long_running()
except asyncio.CancelledError:
    await cleanup()
    raise  # MUST re-raise
```
- ∅swallow `CancelledError` — it must propagate

## Async Context Managers

- Use `@asynccontextmanager` from `contextlib` for simple async context managers
- Implement `__aenter__` / `__aexit__` for class-based async context managers
- Database sessions, HTTP clients, and file handles should always be opened via `async with`

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def managed_client():
    client = httpx.AsyncClient()
    try:
        yield client
    finally:
        await client.aclose()
```

## Async Generators and Streams

- Use `async def` + `yield` for async generators (streaming DB results, chunked responses)
- Annotate as `AsyncGenerator[YieldType, None]`
- Consume with `async for item in gen():`
- ∅`list(gen())` on async generators — use `[item async for item in gen()]`

## FastAPI / SQLAlchemy Specifics

- All FastAPI route handlers: `async def` — ∅sync def for I/O routes (blocks Uvicorn worker)
- SQLAlchemy: use `AsyncSession` + `await session.execute(...)` — ∅sync `Session`
- DB dependency: `yield` inside `async def get_db()` — commit/rollback in the generator, not the caller
- Alembic `env.py`: use `run_async_migrations()` pattern with `AsyncEngine.connect()`

## Testing Async Code

- Use `pytest-asyncio` with `asyncio_mode = "auto"` in `pyproject.toml`
- ∅`asyncio.run()` in tests — mark test functions `async def` and let pytest-asyncio handle the loop
- ∅`anyio.run()` in tests when using pytest-asyncio — pick one runner per project
- Use `httpx.AsyncClient` + `ASGITransport(app=app)` for FastAPI integration tests (∅`TestClient` for async apps)

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| `result = coro()` without `await` | `result = await coro()` |
| `time.sleep(1)` in async def | `await asyncio.sleep(1)` |
| Sync `requests` inside async handler | `httpx.AsyncClient` |
| `asyncio.run()` inside running loop | Just `await` the coroutine |
| Swallowing `CancelledError` | Always re-raise after cleanup |
| Missing `async with` on AsyncSession | Wrap all session usage in `async with` |

## Quick Verify

All `async def` functions are awaited at call sites · `uv run mypy .` → 0 errors · ∅`time.sleep` in async code · ∅sync `Session` in async context · all DB operations use `await`
