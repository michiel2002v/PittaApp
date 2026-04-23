---
name: python-pydantic
description: Best practices for Pydantic v2. Use when designing request/response models, writing custom validators, using model_serializer, configuring BaseSettings, working with discriminated unions, computed fields, or reviewing Pydantic models for security (extra="forbid", input hardening).
---
trig: pydantic·basemodel·field·validator·model_validator·model_serializer·configdict·baseSettings·discriminated-union·computed_field
in: python-code·schema-code

# Pydantic v2 Best Practices

## Model Configuration (mandatory defaults)

```python
from pydantic import BaseModel, ConfigDict

class RequestModel(BaseModel):
    """Base for all request models — forbids extra fields (input hardening)."""
    model_config = ConfigDict(extra="forbid")

class ResponseModel(BaseModel):
    """Base for all response models — allows mapping from ORM objects."""
    model_config = ConfigDict(from_attributes=True)
```

- ALL request models: `extra="forbid"` — rejects unknown fields at validation, prevents parameter pollution
- ALL response models that map from SQLAlchemy ORM objects: `from_attributes=True`
- ∅`orm_mode = True` (Pydantic v1 syntax) — use `from_attributes=True`
- ∅`Config` inner class (Pydantic v1) — use `model_config = ConfigDict(...)`

## Field Declarations

```python
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr

class CreateUserRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255, description="Display name of the user.")
    email: EmailStr = Field(description="Primary email address.")
    age: int = Field(ge=0, le=150, description="Age in years.")
    tags: list[str] = Field(default_factory=list, description="Optional tags.")
    role: str = Field(default="user", pattern=r"^(user|admin)$")
```

- Use `Field(...)` for constraints: `min_length`, `max_length`, `ge`, `le`, `gt`, `lt`, `pattern`
- Use `Field(description=...)` on all fields of public API models (populates OpenAPI schema)
- ∅`Optional[T]` → `T | None` with an explicit default: `field: str | None = None`
- ∅bare `field: str` with no constraints on user-supplied strings — validate length

## Validators

```python
from pydantic import field_validator, model_validator
from typing import Self

class CreateItemRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    start_date: date
    end_date: date

    @field_validator("name")
    @classmethod
    def name_must_not_be_whitespace_only(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v.strip()

    @model_validator(mode="after")
    def end_date_after_start(self) -> Self:
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        return self
```

- `@field_validator` for single-field validation — always `@classmethod`
- `@model_validator(mode="after")` for cross-field validation — returns `Self`
- `@model_validator(mode="before")` for raw dict pre-processing (use sparingly)
- ∅mutating input inside a validator unless deliberate normalisation (e.g. `.strip()`)
- Validators raise `ValueError` (or `PydanticCustomError`) — ∅other exception types

## Serialization

```python
from pydantic import BaseModel, model_serializer, field_serializer

class ItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_datetime(self, v: datetime) -> str:
        return v.isoformat()
```

- Use `@field_serializer` for per-field output transformation
- Use `@model_serializer` for full model output transformation (rare — prefer field-level)
- ∅`dict()` (v1 compat) → use `.model_dump()` / `.model_dump_json()`
- ∅`parse_obj()` / `parse_raw()` (v1) → use `Model.model_validate(data)` / `Model.model_validate_json(raw)`

## Discriminated Unions

```python
from typing import Annotated, Literal
from pydantic import BaseModel, Field

class CatEvent(BaseModel):
    type: Literal["cat"]
    meows: int

class DogEvent(BaseModel):
    type: Literal["dog"]
    barks: int

AnimalEvent = Annotated[
    CatEvent | DogEvent,
    Field(discriminator="type")
]
```

- Use `Literal` type on the discriminator field for each variant
- `Field(discriminator="field_name")` in the `Annotated` alias — avoids O(n) validation
- Use for webhook payloads, event buses, and any polymorphic input

## Settings (pydantic-settings)

```python
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    database_url: str = Field(description="Full async DB connection string.")
    secret_key: SecretStr = Field(description="JWT signing key.")
    debug: bool = False
    allowed_origins: list[str] = Field(default_factory=list)

settings = Settings()
```

- Use `SecretStr` for passwords, tokens, and keys — prevents accidental logging (`str(secret)` shows `**secret**`)
- `case_sensitive=False` — allows `DATABASE_URL`, `database_url`, and `Database_Url` to match
- ∅`os.getenv(...)` in application code — always go via `settings`
- ∅hardcoded defaults for secrets — `Field()` with no default forces env var to be present

## Computed Fields

```python
from pydantic import BaseModel, computed_field

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    last_name: str

    @computed_field
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
```

- Use `@computed_field` + `@property` for derived response fields — ∅pre-computing in service layer just for serialisation

## Type Safety Rules

- ∅`Any` in request or response model fields
- ∅`dict` as a field type for structured data — define a nested `BaseModel`
- ∅dynamically constructed models (`create_model(...)`) in request-handling hot paths
- Return Pydantic model instances from services — ∅pass raw dicts between layers

## Performance

- `model_validate` is faster than constructing then validating — use for ORM→schema mapping:
  `ItemResponse.model_validate(orm_obj)` not `ItemResponse(id=orm_obj.id, ...)`
- Use `model_validate_json(raw_bytes)` directly for JSON input (skips intermediate dict)
- ∅nested `model_validate` in a tight loop without profiling — prefer selective field extraction

## Quick Verify

All request models have `extra="forbid"` · all response models mapping ORM objects have `from_attributes=True` · ∅`Optional[T]` · ∅`dict()` / `parse_obj()` (v1 methods) · `SecretStr` on all secret/password fields · `uv run mypy .` → 0 errors
