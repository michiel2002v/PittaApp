---
name: fastapi-openapi
description: Create FastAPI endpoints with proper OpenAPI documentation. Use when building or reviewing FastAPI endpoints, setting up OpenAPI/Swagger docs, working with Pydantic response models, APIRouter, dependency injection, or endpoint status codes.
---
trig: fastapi·router·apirouter·openapi·swagger·pydantic·response_model·status_code·depends
in: python-code·api-endpoint·openapi-spec

# FastAPI with OpenAPI Best Practices

Your goal is to help me create well-structured FastAPI endpoints with correct types and comprehensive OpenAPI documentation.

## Router Organisation

- One `APIRouter` per domain module — include in `main.py` with a shared prefix and tags
- Prefix all routers: `/api/v{N}/{domain}` (e.g. `/api/v1/users`)
- Use `tags=["domain-name"]` on the router, not on individual endpoints
- Group related CRUD endpoints in the same router file
- Keep `router.py` free of business logic — delegate to `service.py`

## Request and Response Models

- Define explicit Pydantic `BaseModel` subclasses for every request and response — ∅naked dict
- Separate request schemas (`CreateRequest`, `UpdateRequest`) from response schemas (`UserResponse`)
- Use `model_config = ConfigDict(extra="forbid")` on all request models (input hardening)
- Use `from_attributes=True` on response models that map from ORM objects
- Use `UUID` not `int` for public-facing IDs
- Annotate optional fields as `field: T | None = None` (∅`Optional[T]`)

## Endpoint Declaration

- Declare `response_model=` explicitly on every endpoint — ∅rely on FastAPI inference
- Declare `status_code=` explicitly — use `201` for creates, `204` for deletes with no body
- Use `Annotated[T, Depends(...)]` for injected dependencies (preferred over default arg style)
- Use `Annotated[T, Path(...)]` / `Annotated[T, Query(...)]` for path/query parameter metadata
- Mark all endpoint functions `async def` — ∅sync def for I/O-bound handlers

## OpenAPI Documentation

- Add `summary=` and `description=` to every endpoint
- Add `responses={404: {"description": "Not found"}, 422: ...}` for non-default status codes
- Use `openapi_extra={"security": [...]}` to document auth requirements per route group
- Version the OpenAPI schema via the `version=` field in `FastAPI()`
- Use `Field(description="...", example="...")` on Pydantic fields for schema enrichment

## Authentication and Authorization

- Apply auth via `Depends(get_current_user)` at the router level (∅per-endpoint decoration)
- Use router-level `dependencies=[Depends(get_current_user)]` for uniform protection
- ∅optional auth — every protected route must require a valid token
- Implement ownership checks in the service layer, not the router

## Error Handling

- Raise `HTTPException(status_code=..., detail=...)` for expected errors
- Register custom exception handlers in `core/exceptions.py` for domain errors
- Return structured `detail` dicts consistent with ProblemDetail pattern:
  `{"type": "...", "title": "...", "detail": "...", "instance": "..."}`
- ∅bare `raise Exception(...)` in router or service — use typed domain exceptions

## Dependency Injection

- Use `FastAPI`'s `Depends()` for all I/O resources (DB session, auth, settings)
- Never import module-level singletons for I/O resources into routers — use `Depends()`
- Use `app.dependency_overrides` in tests to substitute real deps with test doubles

## Lifecycle

- Use `lifespan` context manager for startup/shutdown — ∅deprecated `@app.on_event`

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown

app = FastAPI(lifespan=lifespan)
```

## Example: Minimal CRUD Router

```python
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from {package}.core.auth import get_current_user, CurrentUser
from {package}.{domain}.schemas import CreateRequest, ItemResponse
from {package}.{domain}.service import ItemService

router = APIRouter(prefix="/items", tags=["items"])

@router.post(
    "/",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new item",
)
async def create_item(
    body: CreateRequest,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[ItemService, Depends()],
) -> ItemResponse:
    return await service.create(body, owner_id=current_user.id)

@router.get(
    "/{item_id}",
    response_model=ItemResponse,
    summary="Get item by ID",
    responses={404: {"description": "Item not found"}},
)
async def get_item(
    item_id: UUID,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[ItemService, Depends()],
) -> ItemResponse:
    item = await service.get_by_id(item_id, owner_id=current_user.id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item
```

## Quick Verify

`uv run ruff check .` → 0 issues · `uv run mypy .` → 0 errors · all endpoints have `response_model=` and `status_code=` · no naked dict returns · no sync route handlers
