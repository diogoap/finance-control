# UI migration: AngularJS → Vue 3

The frontend migration from AngularJS 1.x + Bower + Bootstrap 3 + ui-grid to Vue 3 + Vite + PrimeVue + Tailwind is **complete**. The `static/` directory has been deleted; Express serves only the Vue SPA at `/app/*` plus the JSON API.

Read [ARCHITECTURE.md](./ARCHITECTURE.md) first for the overall system context.

## Final stack

| Concern             | Choice                                                          |
| ------------------- | --------------------------------------------------------------- |
| Framework           | Vue 3 (Composition API) + TypeScript                            |
| Build               | Vite, output to `web/dist/`, base path `/app/`                  |
| Component library   | PrimeVue 4 (Aura preset, light/dark via `.dark` selector)       |
| Styling             | Tailwind v4 utilities for layout/spacing only                   |
| Icons               | PrimeIcons                                                      |
| Routing             | Vue Router (`createWebHistory('/app/')`) with public/private guard |
| State               | Composables in `web/src/composables/`; Pinia not yet needed     |
| HTTP                | axios instance with auth-bridge interceptor                     |
| Auth                | Google OAuth → callback redirects to `/app/#id=...&token=...`; `consumeOAuthHash()` in `web/src/lib/session.ts` parses and stores |
| Lockfile            | **Disabled** in `web/.npmrc` (`package-lock=false`) — see Gotchas |

## Routing

```
/api/*         → Express JSON API
/auth/*        → Google OAuth + logoff endpoints
/app/*         → Vue SPA (web/dist)
/, /login,     → 302 redirect to /app/, /app/login, /app/logoff
/logoff
anything else  → 302 redirect to /app/
```

The Vue router has a `beforeEach` guard that bounces unauthenticated requests to `/login`, except for routes flagged `meta.public: true` (`/login`, `/logoff`).

## Component mapping cheat-sheet

| Legacy widget                         | PrimeVue replacement                                            |
| ------------------------------------- | --------------------------------------------------------------- |
| `ui-grid`                             | `DataTable` + `Column`, `selectionMode="single"`                |
| ui-grid footer aggregation            | `<DataTable>` `<template #footer>` slot                         |
| `uib-modal` (with templateUrl)        | `Dialog` with `v-model:visible`                                 |
| `confirmModal.html` pattern           | `ConfirmDialog` (singleton) + `useConfirm()`                    |
| `uib-alert`                           | `Toast` (singleton) + `useToast()`                              |
| Loading spinner overlay               | `ProgressSpinner` inside an absolutely-positioned overlay div   |
| AngularJS form validation             | Computed `errors` map; mirror Portuguese messages literally     |
| `ng-model` checkbox                   | `Checkbox` with `v-model` + `binary` prop                       |
| `select` with `ng-options`            | `Select` with `:options`                                        |
| Font Awesome (`fa-plus`)              | PrimeIcons (`pi pi-plus`)                                       |

## Build, dev, deploy

| Mode | Command | URL |
| ---- | ------- | --- |
| Dev (HMR)               | `docker compose up --build`                                                | `http://localhost:5173/app/` (Vite proxies `/api`+`/auth` to Express on `:8500`) |
| Integrated smoke test   | `npm run build:web && docker compose up --build`                           | `http://localhost:8500/` |
| Production              | `docker compose -f docker-compose-server.yml up --build` (Portainer)       | port 8500 |

`docker/web/Dockerfile` is multi-stage and builds `web/dist/` itself in a `web-builder` stage — Portainer just clones + composes.

## Gotchas (still relevant)

### Server-side schema requires every field on PATCH

`api/services/<resource>Service.js` validators use `jsonschema` with `required` arrays that include `user_id` (and other backend-injected fields). On `edit`, the frontend MUST send the full document with the edited fields overlaid — sending only the form fields returns 400.

The form-dialog pattern: load the full document on open, store it in a ref, and on submit return `{ ...loaded, ...editedFields }`.

### Incomes/Expenses with `detail[]`

The schema's `anyOf` allows omitting `account_id`/`category_id`/`currency_id` when `detail.length > 0`. Set them to `undefined` (not `null` or `""`) on submit so `JSON.stringify` drops them.

Expenses additionally has a `oneOf` that requires `amountPaid > 0` whenever `status === 'Pago'` and there is no detail array — mirror this check in the form.

### npm bug #4828: platform-pinned lockfiles break native bindings

Tailwind v4's `@tailwindcss/oxide` is a Rust-built native module. With a `package-lock.json`, npm skips installing the Linux binding when Docker reads a macOS-generated lockfile. `web/.npmrc` sets `package-lock=false` so neither host nor container generates a platform-specific lockfile. Don't add a `package-lock.json` under `web/`.

### Tailwind v4 needs Node 20+

`@tailwindcss/oxide@4.x` declares `engines.node: ">= 20"`. The Dockerfile and the `web-frontend` compose service both use `node:20`. The Express server itself is fine on Node 18+.

### Bind-mount + named-volume node_modules

`docker-compose.yml` bind-mounts `./web` to `/web` in both containers, with a named volume overlaid at `/web/node_modules` to keep Linux-installed deps isolated. After the named volume is initialized, the host's `web/node_modules` directory may appear empty — that's expected. Run `npm install` on the host once to repopulate when you need to build outside Docker.

If the dev container's deps get into a bad state:

```bash
docker compose down
docker volume rm finance-control_web_frontend_node_modules
docker compose up --build
```

## File index

```
finance-control/
  server.js                          # Express: /api, /auth, /app/* SPA, redirects for /, /login, /logoff
  web/                               # Vue 3 app
    package.json
    vite.config.ts                   # base: '/app/', proxy /api+/auth → Express
    tsconfig.json
    .npmrc                           # package-lock=false
    index.html
    public/
      favicon.png
    src/
      main.ts                        # createApp + plugins, mounts #app
      App.vue                        # AppNavbar + Toast + ConfirmDialog + RouterView
      router.ts                      # Vue Router; auth guard via meta.public; calls consumeOAuthHash() before createWebHistory
      primevue.ts                    # Theme + pt-BR locale
      style.css
      lib/
        api.ts                       # axios + auth interceptor + 401 redirect to /app/login
        session.ts                   # getSession(), isLoggedIn(), consumeOAuthHash()
      components/
        AppNavbar.vue                # PrimeVue Menubar (hidden when not logged in)
      views/
        HomeView.vue, CategoriesView.vue, IncomesView.vue, ExpensesView.vue,
        AccountsView.vue, TransfersView.vue, LoansView.vue,
        LoginView.vue, LogoffView.vue
        <resource>/<Resource>FormDialog.vue
      composables/
        useCategories.ts, useIncomes.ts, useExpenses.ts, useAccounts.ts,
        useTransfers.ts, useLoans.ts, useTotals.ts, useReferenceData.ts,
        useAuth.ts, useTheme.ts, useIsMobile.ts
  docker/web/Dockerfile              # Multi-stage: builds web/dist in web-builder stage
  docker-compose.yml                 # web (Express) + web-frontend (Vite) + mongodb
  docker-compose-server.yml          # Production single-service compose
```
