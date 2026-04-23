# domain-react Reference

Overlay on §4a core gates. Apply WITH core, not instead of. ∀gate:0warn.

## Package Management (pnpm — mandatory)
- ALL dependency management via `pnpm` only — ∅npm ∅yarn direct
- Add: `pnpm add <package>` · dev: `pnpm add -D <package>`
- `pnpm-lock.yaml` MUST be committed
- ∅floating `*` or `latest` versions in `package.json` — pin `^major.minor`
- Audit: `pnpm audit` → 0 high/critical findings before release

## Val+
- `pnpm typecheck` (`tsc --noEmit`) → 0 errors
- `pnpm lint` (ESLint) → 0 issues · ∅eslint-disable without comment
- TypeScript: `strict: true` in `tsconfig.json` — non-negotiable
- ∅`@ts-ignore` / `@ts-nocheck` without comment explaining why
- ∅`any` type without explicit justified comment; prefer `unknown` at boundaries

## Cor+
- ∅mutate props or external state directly → use state/dispatch/callbacks
- ∅stale closure in `useEffect` — ∀deps declared in dep array
- ∅derived state in `useState` — derive directly from existing state/props
- ∅key={index} on dynamic lists where items can reorder/delete → use stable ID

## Sec+
- ∅`dangerouslySetInnerHTML` — if unavoidable, sanitize with `DOMPurify`
- ∅inline event handlers with unvalidated user input
- ∅credentials / tokens stored in `localStorage` → use httpOnly cookies or memory
- ∅`eval()` / `new Function()` on any user input
- ∅`target="_blank"` without `rel="noopener noreferrer"`
- CSP headers configured at hosting layer — document in ops
- ∅hardcoded API keys / secrets in frontend code or `.env` files committed to repo
- HTTPS only; API base URLs from environment variables (`VITE_API_URL`)

## Typ+
- ALL component props: explicit TypeScript interface or type — ∅implicit `{}` or `any`
- API response types: generated from OpenAPI spec or manually typed — ∅`any` on fetch results
- Event handlers: use React's built-in event types (`React.ChangeEvent<HTMLInputElement>`)
- ∅`React.FC` — use plain function with explicit return type or inferred
- Exports: named exports preferred over default for components (tree-shaking + refactoring)
- `as const` for string literal unions / enums

## Tst+
- Framework: Vitest + React Testing Library — ∅Enzyme ∅jest (unless existing project)
- Test behaviour, not implementation: query by role/label/text — ∅querySelector
- `screen.getByRole` preferred; `getByTestId` as last resort only
- ∅snapshot tests for logic — use for visual regression only, commit reviewed snapshots
- Mock API calls: `msw` (Mock Service Worker) — ∅mock fetch/axios directly in tests
- Async: `await userEvent.click()` + `waitFor()` — ∅`act()` directly unless unavoidable
- Coverage: `vitest --coverage --coverage.thresholds.lines=80`
- Name: `describe('<ComponentName>') / it('should <behaviour> when <condition>')`

## Component+
- One component per file; filename matches component name (PascalCase)
- ∅God components (>300 LOC) → split into sub-components + custom hooks
- Custom hooks: extracted to `hooks/` folder; name `use<Name>`
- Side effects in `useEffect` only — ∅side effects in render body
- Server state: TanStack Query (`useQuery`, `useMutation`) — ∅manual fetch+useState for server data
- Client state: React state or Zustand — choose 1 per project
- ∅prop drilling >2 levels → lift state or use context/store

## Routing+ (TanStack Router — mandatory)
- ALL routing via TanStack Router — ∅React Router ∅Next.js routing (unless project-specific)
- Type-safe routes: define route tree in `routeTree.gen.ts` (generated) — ∅string-only `navigate()`
- Route params: typed via route definition, accessed via `useParams()`
- Protected routes: auth check in route `beforeLoad` — ∅inline auth checks in components
- `Link` component for internal navigation — ∅`<a href>` for SPA links

## Perf+
- `React.memo` only when profiler confirms unnecessary re-renders — ∅premature memoization
- `useCallback` / `useMemo`: only for referentially stable callbacks passed to memoized children
- ∅inline object/array literals in JSX props that create new refs on every render
- Code splitting: `React.lazy` + `Suspense` for route-level components
- ∅oversized bundle: run `pnpm build --analyze` before release; flag bundles >250 KB un-gzipped

## A11y+ (Accessibility)
- All interactive elements reachable via keyboard (Tab + Enter/Space)
- Images: `alt` attribute always present (empty string for decorative images)
- Form fields: `<label>` associated via `htmlFor` or `aria-label`
- ∅colour as sole conveyor of meaning
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<header>`) — ∅div-soup
- `eslint-plugin-jsx-a11y` active in ESLint config

## Mnt+
- Absolute imports configured (`@/...`) — ∅long relative import chains (`../../../`)
- Environment variables: `VITE_` prefix; typed via `vite-env.d.ts` interface — ∅`process.env` (use `import.meta.env`)
- ∅`console.log` in production code → use structured logger or remove
- API client in separate `api/` module — ∅inline fetch in components
- Constants in `constants/` — ∅magic strings/numbers inline
- Standard folder layout (see `Str+` below)

## Str+ (Project Structure — mandatory layout)

```
src/
├── api/                     # API client layer — one file per domain
│   ├── client.ts            # axios/fetch instance with base URL + auth headers
│   ├── {domain}.api.ts      # typed API functions for one domain
│   └── generated/           # OpenAPI-generated types (do not edit manually)
│       └── index.ts
├── components/              # shared/reusable components
│   └── {ComponentName}/
│       ├── index.tsx
│       └── {ComponentName}.test.tsx
├── features/                # feature-scoped components, hooks, and types
│   └── {feature}/
│       ├── {Feature}.tsx
│       ├── use{Feature}.ts
│       └── {feature}.schema.ts   # Zod schema for this feature's forms
├── hooks/                   # app-wide custom hooks
├── routes/                  # TanStack Router route definitions
│   ├── __root.tsx           # root layout + error boundary
│   ├── _authenticated.tsx   # auth guard layout route
│   └── {route}.tsx
├── stores/                  # Zustand stores (if used)
├── types/                   # shared TypeScript types (not Zod schemas)
├── constants/               # app-wide constants
└── main.tsx                 # app entry point + router + query client setup
```

Rules:
- ∅business logic in components → belongs in `use{Feature}.ts` hooks
- ∅API calls in components → belongs in `api/{domain}.api.ts` + TanStack Query
- ∅Zod schemas mixed with component files — keep in `{feature}.schema.ts`
- ∅`generated/` files edited manually — regenerate from OpenAPI spec

## Form+ (Forms — React Hook Form + Zod — mandatory)

- ALL forms: `react-hook-form` + `zod` resolver — ∅uncontrolled inputs ∅manual `useState` for form fields
- Schema-first: define Zod schema in `{feature}.schema.ts` before writing the form component
- Infer TypeScript type from schema: `type FormData = z.infer<typeof schema>`

```typescript
// {feature}.schema.ts
import { z } from "zod"

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
})
export type CreateItemForm = z.infer<typeof createItemSchema>
```

```typescript
// {Feature}Form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createItemSchema, type CreateItemForm } from "./createItem.schema"

export function CreateItemForm({ onSubmit }: { onSubmit: (data: CreateItemForm) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateItemForm>({
    resolver: zodResolver(createItemSchema),
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} aria-invalid={!!errors.name} />
      {errors.name && <span role="alert">{errors.name.message}</span>}
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  )
}
```

Rules:
- ∅`onChange` + `useState` for form field management when `react-hook-form` is installed
- ∅Zod `.parse()` in components — use resolver; parse only at API boundary if needed
- Server errors: map to `setError("fieldName", { message: "..." })` — ∅toast-only for field errors
- Reusable form fields: extract to `components/forms/` with `forwardRef` + `register` prop pass-through

## Err+ (Error Boundaries)

- Every route MUST have an error boundary — define in `__root.tsx` and per-route where needed
- TanStack Router: use `errorComponent` prop on route definitions

```typescript
// routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router"

export const Route = createRootRoute({
  component: () => <Outlet />,
  errorComponent: ({ error }) => <RootErrorBoundary error={error} />,
})
```

```typescript
// components/RootErrorBoundary.tsx — catches unknown thrown errors
export function RootErrorBoundary({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred"
  return (
    <main role="alert" aria-live="assertive">
      <h1>Something went wrong</h1>
      <p>{message}</p>
    </main>
  )
}
```

- TanStack Query: use `onError` / `throwOnError` for query-level error propagation to boundary
- ∅swallow errors silently in `catch` blocks in components — rethrow or surface to boundary
- API 401 responses: redirect to login via router, do not surface as error boundary

## Api+ (API Integration — FastAPI/OpenAPI type generation)

- API types MUST be generated from the FastAPI OpenAPI spec — ∅manually duplicating backend types
- Tool: `openapi-typescript` (generates TypeScript types from `/openapi.json`)
- Types go in `src/api/generated/` — committed but never manually edited

```bash
# Add to package.json scripts:
"generate:api": "openapi-typescript http://localhost:8000/openapi.json -o src/api/generated/index.ts"
# Run after backend schema changes:
pnpm generate:api
```

- API client (`src/api/client.ts`): single axios instance with base URL + auth headers

```typescript
// src/api/client.ts
import axios from "axios"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,  // for httpOnly cookie auth
})

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login"  // or use router.navigate
    }
    return Promise.reject(error)
  }
)
```

- Domain API functions (`src/api/{domain}.api.ts`): typed wrappers around client

```typescript
import type { components } from "@/api/generated"
import { apiClient } from "./client"

type CreateItemRequest = components["schemas"]["CreateItemRequest"]
type ItemResponse = components["schemas"]["ItemResponse"]

export async function createItem(data: CreateItemRequest): Promise<ItemResponse> {
  const response = await apiClient.post<ItemResponse>("/api/v1/items", data)
  return response.data
}
```

- TanStack Query: use these typed API functions inside `useQuery`/`useMutation` hooks — ∅`fetch` directly in components
- ∅`any` on API response types — use generated types or explicit `unknown` + type guard

Rules:
- `VITE_API_BASE_URL` in `.env.local` (dev) and CI env (test/prod) — ∅hardcoded URLs
- ∅`withCredentials: false` when backend uses httpOnly cookies for auth
- Re-generate API types after every backend schema change; commit the generated file
- If backend is not yet available: mock with `msw` (`src/mocks/handlers.ts`) using the same generated types
