---
name: python-docs
description: Ensure Python types and functions are documented with docstrings following best practices. Use when adding or reviewing docstrings on public/internal members, writing Google-style docstrings, auditing Python code for missing documentation, or enforcing docstring coverage with interrogate.
---
trig: docstring·python-documentation·google-style·sphinx·interrogate·missing-docstring·autodoc
in: python-code

# Python Documentation Best Practices

## Docstring Convention: Google Style (mandatory)

This project uses **Google-style docstrings**. All public classes, functions, and methods must have a docstring.
Internal (`_prefixed`) members should be documented when non-trivial.

```python
def get_item_by_id(item_id: UUID, owner_id: UUID) -> Item | None:
    """Retrieve an item by ID, scoped to the given owner.

    Returns ``None`` if no item with the given ID exists for the owner.
    Does not raise on missing item — callers must handle ``None``.

    Args:
        item_id: The unique identifier of the item to retrieve.
        owner_id: The ID of the user who must own the item.

    Returns:
        The matching ``Item`` ORM instance, or ``None`` if not found.

    Raises:
        PermissionDeniedError: If the item exists but belongs to a different owner.
    """
```

## Summary Line

- First line: one sentence, imperative mood, ending with a period.
  - ✓ `"""Create a new item and persist it to the database."""`
  - ✗ `"""Creates item"""` (no period, wrong mood)
  - ✗ `"""This function creates a new item..."""` (don't describe, do)
- Leave a blank line between the summary and the Args/Returns/Raises sections.

## Sections

| Section | When to include | Format |
|---|---|---|
| `Args:` | Function has ≥1 parameter (excluding `self`) | `name: Description starting with capital.` |
| `Returns:` | Function returns a non-trivial value | Noun phrase; omit if return type is obvious from annotation |
| `Raises:` | Function raises a documented exception intentionally | `ExceptionType: Condition under which it is raised.` |
| `Yields:` | Async/sync generator | What each yielded value represents |
| `Note:` | Important non-obvious behaviour | Free prose |
| `Example:` | Public utility functions / complex usage | Code block using `>>>` or fenced |

## Class Docstrings

```python
class ItemService:
    """Handles business logic for item creation, retrieval, and deletion.

    Depends on ``ItemRepository`` for persistence. Does not interact
    with the HTTP layer directly.

    Args:
        repo: The repository used for all item DB operations.
    """

    def __init__(self, repo: ItemRepository) -> None:
        self._repo = repo
```

- Class `__init__` parameters documented in the class docstring, not in `__init__` itself.
- ∅duplicate `__init__` docstring that repeats the class docstring.

## Module Docstrings

```python
"""Item domain — router, service, repository, and ORM models.

Public API:
    ItemRouter: FastAPI APIRouter for /items endpoints.
    ItemService: Business logic for item management.
"""
```

- Every public module should have a one-paragraph module docstring.
- List the most important exports; internal helpers do not need to be listed.

## Pydantic Models

```python
class CreateItemRequest(BaseModel):
    """Request body for creating a new item.

    Attributes:
        name: Display name for the item. Must be 1–255 characters.
        tags: Optional list of tag strings to associate with the item.
    """

    name: str = Field(description="Display name for the item.", min_length=1, max_length=255)
    tags: list[str] = Field(default_factory=list, description="Optional tags.")
```

- Pydantic `Field(description=...)` is used for OpenAPI schema; the class docstring is for developer docs.
- Both are required on public request/response models.

## SQLAlchemy Models

```python
class Item(Base):
    """ORM model for the ``items`` table.

    Attributes:
        id: Primary key (UUID v4, Python-generated).
        name: Display name, max 255 characters.
        owner_id: Foreign key to the ``users`` table.
        created_at: UTC timestamp set by the database on insert.
    """
```

## Type Annotations as Self-Documentation

- Annotations reduce the need for verbose docstrings on trivial functions — a well-annotated signature can be self-explanatory.
- But: side effects, raising behaviour, `None` semantics, and non-obvious invariants always need prose.

## What Not to Document

- ∅obvious docstrings that just restate the name: `"""Get the id."""` on `def get_id()`
- ∅`Args:` section that only lists `self`
- ∅stale docstrings — a wrong docstring is worse than no docstring; update on every signature change

## Enforcement

```toml
# pyproject.toml
[tool.ruff.lint]
select = ["D"]  # pydocstyle rules via ruff
[tool.ruff.lint.pydocstyle]
convention = "google"

[tool.interrogate]  # optional: fail build if docstring coverage < threshold
fail-under = 80
ignore-init-method = true
ignore-magic = true
```

```bash
# Check docstring coverage
uv run interrogate src/ --fail-under 80

# Check docstring style
uv run ruff check . --select D
```

## Quick Verify

All public classes and functions have a Google-style docstring · summary line is imperative + ends with period · `Args:`, `Returns:`, `Raises:` present where applicable · ∅stale docstrings · `uv run ruff check . --select D` → 0 issues
