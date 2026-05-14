# CLAUDE.md

Guidelines for AI agents working in this repo. Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/UI_MIGRATION.md](./docs/UI_MIGRATION.md) for full context.

## Workflow

- **Never commit directly to `master`.** Always create a feature/chore branch (e.g. `feat/x`, `chore/x`, `fix/x`), push it, and open a PR via `gh pr create`. The user merges.
- Don't push branches with `--force` to shared refs, and don't push to `master` even with confirmation — use a PR.
- Run `npx vue-tsc --noEmit` from `web/` before committing changes that touch the Vue app.
- Commit messages: short imperative subject, no body unless the *why* is non-obvious. Match the existing log style (`git log --oneline`).

## Project shape

- Vue 3 + Vite + PrimeVue (Aura) + Tailwind v4 + TypeScript SPA at `/app/*` (source: `web/src/`). All screens — including Login/Logoff — live here.
- Node/Express backend in `api/` (api → service → model layers) with MongoDB via Mongoose. Auth is Google OAuth2 producing an opaque token in `Authorization`, with `User-Id` alongside.
- OAuth callback redirects to `/app/#id=...&token=...`; `consumeOAuthHash()` (defined in `web/src/lib/session.ts`) is invoked at the top of `web/src/router.ts`, before `createWebHistory` — Vue Router snapshots `window.location` on history creation, so the hash must be parsed and stripped first. It writes the `loggedUser*` keys to `localStorage`. The router's `beforeEach` guard then sends unauthenticated requests to `/login` (routes flagged `meta.public: true` are exempt).
- Bare `/`, `/login`, `/logoff` 302-redirect to `/app/...` server-side so old links keep working.

## Gotchas

- **JSON schema on edit/PATCH:** `api/services/*Service.js` validators require the full document (e.g. `user_id` is mandatory on edit). Form dialogs must overlay edited fields onto the originally-fetched document — sending only form fields returns 400.
- **Incomes/Expenses with details:** the schema's `anyOf` allows omitting `account_id`/`category_id`/`currency_id` when `detail.length > 0`. Set them to `undefined` (not `null` or `""`) on submit so `JSON.stringify` drops them.
- **Expenses status:** schema's `oneOf` requires `amountPaid > 0` whenever `status === 'Pago'` and there's no detail array. Mirror this check in forms.
- **Lockfile:** `web/.npmrc` has `package-lock=false` because Tailwind v4's native bindings hit npm bug #4828 with platform-pinned lockfiles. Don't add a `package-lock.json` under `web/`.
- **Node version:** Vue build needs Node 20+. The Express server is fine on Node 18+.
- **Shared dropdowns:** module-singleton cache in `web/src/composables/useReferenceData.ts` (currencies, accounts, categories-by-type). Defer Pinia until cross-screen reactive invalidation is actually needed.
- **Logoff does a full reload:** `LogoffView` calls `window.location.assign('/app/login')` after the API call so `AppNavbar` (mounted in `App.vue`, captures session at setup) re-renders with cleared state. Don't replace this with `router.push` unless you also make the navbar reactive to session changes.

## Local dev

- Full stack: `docker compose -f docker-compose.yml up` (Express on `:8500`, Vite hot-reload on `:5173`, Mongo).
- Web only: `cd web && npm install && npm run dev`.
- Build: `npm --prefix web run build` (also runs from `package.json` root via `npm run build:web`).

## Production

Portainer runs `docker compose -f docker-compose-server.yml up`. `docker/web/Dockerfile` is multi-stage and builds `web/dist` itself in a `web-builder` stage — no separate build step needed before deploy.
