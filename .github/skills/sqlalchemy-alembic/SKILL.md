---
name: sqlalchemy-alembic
description: Best practices for SQLAlchemy 2.0 async ORM and Alembic migrations. Use when designing ORM models with DeclarativeBase, writing async repository queries, configuring AsyncSession, managing Alembic migrations, handling data vs schema migrations, preventing N+1 queries, or reviewing SQLAlchemy code for security and performance.
---
trig: sqlalchemy·alembic·asyncsession·declarativebase·mapped·mapped_column·relationship·selectinload·joinedload·migration·revision·upgrade·downgrade
in: python-code·orm-code·migration-file

# SQLAlchemy 2.0 + Alembic Best Practices

Your goal is to help me follow best practices when working with SQLAlchemy 2.0 async ORM and Alembic migrations.

## ORM Model Design (DeclarativeBase — mandatory)

```python
# src/{package}/models/base.py
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass

class Base(DeclarativeBase):
    pass  # share one Base across all domain models
```

```python
# src/{package}/{domain}/models.py
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from {package}.models.base import Base

class Item(Base):
    __tablename__ = "items"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    owner: Mapped["User"] = relationship(back_populates="items", lazy="raise")
```

Rules:
- ∅legacy `declarative_base()` — use `DeclarativeBase` (SQLAlchemy 2.0)
- ∅`Column(...)` — use `mapped_column(...)` with `Mapped[T]` annotations
- Use `UUID` (not `int`) for public-facing PKs; use `default=uuid4` (Python-side) not `server_default`
- `lazy="raise"` on all relationships — force explicit loading, prevent accidental N+1
- ∅bare `nullable=True` columns for required data — use `nullable=False` explicitly

## Async Database Setup

```python
# src/{package}/database.py
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from {package}.settings import settings

engine = create_async_engine(
    settings.database_url,           # e.g. "postgresql+asyncpg://..."
    echo=settings.debug,
    pool_pre_ping=True,              # detect stale connections
    pool_size=10,
    max_overflow=20,
)
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

- ∅sync `create_engine` / `Session` in an async project
- ∅`expire_on_commit=True` with async (causes lazy-load errors after commit)
- `pool_pre_ping=True` — required for long-running services to detect dropped connections
- Commit and rollback in `get_db()` — ∅commit in repository methods

## Repository Pattern

```python
# src/{package}/{domain}/repository.py
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from {package}.{domain}.models import Item

class ItemRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, id: UUID) -> Item | None:
        result = await self._db.execute(
            select(Item).where(Item.id == id)
        )
        return result.scalar_one_or_none()

    async def get_with_owner(self, id: UUID) -> Item | None:
        result = await self._db.execute(
            select(Item)
            .where(Item.id == id)
            .options(selectinload(Item.owner))  # explicit eager load
        )
        return result.scalar_one_or_none()

    async def list_by_owner(self, owner_id: UUID, limit: int, offset: int) -> list[Item]:
        result = await self._db.execute(
            select(Item)
            .where(Item.owner_id == owner_id)
            .order_by(Item.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def create(self, item: Item) -> Item:
        self._db.add(item)
        await self._db.flush()   # write to DB within transaction; session commits in get_db()
        await self._db.refresh(item)
        return item

    async def delete(self, item: Item) -> None:
        await self._db.delete(item)
        await self._db.flush()
```

Rules:
- ∅`session.commit()` in repository — commit belongs in `get_db()`
- ∅raw `text("SELECT ...")` without `:named` params — use ORM or `text()` with `bindparams`
- ∅`session.execute(f"SELECT ...")` — f-string SQL is SQL injection
- Always paginate collection queries: `limit` + `offset` parameters required
- ∅`selectinload` on relationships marked `lazy="raise"` — must be explicit at query time

## Preventing N+1 Queries

- All relationships default to `lazy="raise"` — this forces explicit loading decisions
- Use `selectinload(Model.relation)` for one-to-many (separate IN query — avoids cartesian product)
- Use `joinedload(Model.relation)` for many-to-one / one-to-one (JOIN — one query)
- Use `contains_eager()` when you already JOIN in the WHERE clause
- ∅accessing `item.owner` without `selectinload` — will raise `MissingGreenlet` in async context

```python
# Correct: explicit load
stmt = select(Order).options(selectinload(Order.lines)).where(Order.id == id)

# Wrong: lazy access after fetch raises MissingGreenlet in async
order = await repo.get_by_id(id)
print(order.lines)  # RAISES — lazy="raise" blocks this
```

## Alembic Migrations

### Setup

```ini
# alembic.ini — minimal required config
[alembic]
script_location = alembic
```

```python
# alembic/env.py — async-aware (mandatory pattern)
import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from {package}.settings import settings
from {package}.models.base import Base
# import ALL model modules so autogenerate detects them:
import {package}.{domain}.models  # noqa: F401

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    engine = create_async_engine(settings.database_url)
    async with engine.connect() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()

asyncio.run(run_async_migrations())
```

### Migration Rules

| Rule | Detail |
|---|---|
| ∅`Base.metadata.create_all()` in production | Migrations only — never auto-create |
| Every migration has `upgrade()` AND `downgrade()` | Rollback must be possible |
| ∅destructive migration without ADR | `DROP COLUMN`, `DROP TABLE`, data truncation require ADR + approval |
| Data migration ≠ schema migration | Separate Alembic files for data vs schema changes |
| `uv.lock` pinned Alembic version | Pin `alembic>=1.13,<2` |
| CI gate | `uv run alembic check` must pass (0 pending migrations) |

### Commands

```bash
# Create migration (autogenerate from model changes)
uv run alembic revision --autogenerate -m "add items table"

# Apply all pending migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# Check for pending migrations (use in CI)
uv run alembic check

# Show current revision
uv run alembic current
```

### Migration File Rules

- Review autogenerated SQL before committing — autogenerate misses: server defaults, CHECK constraints, custom types
- Name descriptively: `add_items_table`, `add_owner_id_to_items`, `rename_user_email_column`
- ∅`alembic stamp head` as a substitute for running migrations
- ∅`op.execute("raw sql")` for DML — use `op.bulk_insert()` or a separate data migration
- Seed data goes in application startup or a dedicated data migration, not schema migrations

## Security

- ∅f-string SQL: `text(f"SELECT * FROM {table}")` → use parameterized: `text("SELECT * FROM items WHERE id = :id").bindparams(id=item_id)`
- ∅`pickle` anywhere in ORM models or repositories
- DB credentials: loaded from `pydantic-settings` via env — ∅hardcoded in `alembic.ini` or code
- Connection strings must not appear in logs — ∅`echo=True` in production

## Quick Verify

`uv run alembic check` → 0 pending · `uv run mypy .` → 0 errors · ∅`session.commit()` in repository files · ∅f-string SQL · all collection queries have `limit` + `offset` · all relationships have explicit `lazy=` setting
