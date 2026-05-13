# CLAUDE.md

Guidelines for AI agents working in this repo. Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) and [docs/UI_MIGRATION.md](./docs/UI_MIGRATION.md) for full context.

## Workflow

- **Never commit directly to `master`.** Always create a feature/chore branch (e.g. `feat/x`, `chore/x`, `fix/x`), push it, and open a PR via `gh pr create`. The user merges.
- Don't push branches with `--force` to shared refs, and don't push to `master` even with confirmation — use a PR.
- Run `npx vue-tsc --noEmit` from `web/` before committing changes that touch the Vue app.
- Commit messages: short imperative subject, no body unless the *why* is non-obvious. Match the existing log style (`git log --oneline`).

## Project shape

- Two coexisting frontends via the **strangler pattern**:
  - Vue 3 + Vite + PrimeVue (Aura Light) + Tailwind v4 + TypeScript at `/app/*` (source: `web/src/`).
  - Legacy AngularJS 1.x at `/` and other routes (source: `static/`). Only **Login/Logoff** remain on AngularJS.
- Node/Express backend in `api/` (api → service → model layers) with MongoDB via Mongoose. Auth is Google OAuth2 producing an opaque token in `Authorization`, with `User-Id` alongside.
- AngularJS owns the OAuth callback (`/#token=...` is parsed into `localStorage`); Vue reads the same `loggedUserToken` / `loggedUserId` keys and 401-redirects to `/login`.

## Vue migration recipe

For each remaining screen (Login/Logoff): add `views/XView.vue` (+ optional `views/x/XFormDialog.vue`) + `composables/useX.ts`, register the route, add a `<router-link>` in `web/src/components/AppNavbar.vue`, and flip the corresponding AngularJS navbar link in `static/index.html` from `ng-click="changeRoute('/x')"` to `href="/app/x"`. Full per-screen recipe is at the bottom of `docs/UI_MIGRATION.md`.

## Gotchas

- **JSON schema on edit/PATCH:** `api/services/*Service.js` validators require the full document (e.g. `user_id` is mandatory on edit). Form dialogs must overlay edited fields onto the originally-fetched document — sending only form fields returns 400.
- **Incomes/Expenses with details:** the schema's `anyOf` allows omitting `account_id`/`category_id`/`currency_id` when `detail.length > 0`. Set them to `undefined` (not `null` or `""`) on submit so `JSON.stringify` drops them.
- **Expenses status:** schema's `oneOf` requires `amountPaid > 0` whenever `status === 'Pago'` and there's no detail array. Mirror this check in forms.
- **Lockfile:** `web/.npmrc` has `package-lock=false` because Tailwind v4's native bindings hit npm bug #4828 with platform-pinned lockfiles. Don't add a `package-lock.json` under `web/`.
- **Node version:** Vue build needs Node 20+. The Express server is fine on Node 18+.
- **Shared dropdowns:** module-singleton cache in `web/src/composables/useReferenceData.ts` (currencies, accounts, categories-by-type). Defer Pinia until cross-screen reactive invalidation is actually needed.

## Local dev

- Full stack: `docker compose -f docker-compose.yml up` (Express on `:8500`, Vite hot-reload on `:5173`, Mongo).
- Web only: `cd web && npm install && npm run dev`.
- Build: `npm --prefix web run build` (also runs from `package.json` root via `npm run build:web`).

## Production

Portainer runs `docker compose -f docker-compose-server.yml up`. `docker/web/Dockerfile` is multi-stage and builds `web/dist` itself in a `web-builder` stage — no separate build step needed before deploy.
