# Architecture

Personal finance tracker: expenses, incomes, transfers, loans, and balances across multiple accounts and currencies. Single-user-per-record model with Google OAuth login.

## Tech stack

| Layer       | Technology                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| Runtime     | Node.js 18                                                                 |
| Backend     | Express 4, Mongoose 7, Passport (Google OAuth2), jsonschema                |
| Database    | MongoDB 8                                                                  |
| Frontend    | AngularJS 1.x SPA, ui-bootstrap, ui-grid, Bootstrap                        |
| Packaging   | Docker / docker-compose                                                    |
| Auth        | Google OAuth2 → opaque access token in `Authorization` header              |

## High-level architecture

```mermaid
flowchart LR
    User([User])
    Browser[AngularJS SPA<br/>static/index.html]
    Server[Express server<br/>server.js :8500]
    Mongo[(MongoDB<br/>finance-control)]
    Google[Google OAuth2]

    User -->|HTTPS| Browser
    Browser -->|GET /| Server
    Browser -->|/api/* + Authorization, User-Id| Server
    Server -->|Mongoose| Mongo
    Server -->|/auth/google| Google
    Google -->|/auth/google/callback| Server

    subgraph Container[Docker Compose]
        Server
        Mongo
    end
```

The Node process serves both the static SPA and the JSON API from the same origin and port. There is no build step for the frontend — `index.html` and the AngularJS modules under `static/` are shipped as-is.

## Backend module layout

Three layers per resource (api → service → model). `server.js` only wires routes; everything else lives in those three folders.

```mermaid
flowchart TB
    subgraph apis[api/apis - HTTP routes]
        authApi
        accountsApi
        categoriesApi
        expensesApi
        incomesApi
        transfersApi
        loansApi
        currenciesApi
        totalsApi
        generatorApi
        usersApi
    end

    subgraph services[api/services - business logic]
        utilsService[utilsService<br/>ensureAuth, ensureAuthAdmin,<br/>ensureObjectUser]
        usersService
        domainServices[accounts / categories / expenses /<br/>incomes / transfers / loans /<br/>currencies / totals / generator]
    end

    subgraph models[api/models - Mongoose schemas]
        usersModel
        accountsModel
        categoriesModel
        expensesModel
        incomesModel
        transfersModel
        loansModel
        currenciesModel
    end

    apis --> utilsService
    apis --> domainServices
    authApi --> usersService
    domainServices --> models
    usersService --> usersModel
```

Each `*Api.js` exports a function `(app, url) => { app.get/post/patch/delete(...) }` invoked from `server.js`. Domain services follow a uniform CRUD shape (`getById`, `get`, `create`, `edit`, `delete`) plus operation-specific methods (e.g. `expensesService.pay`, `incomesService.receive`). All services use Node-style `(callbackSuccess, callbackError)` callbacks rather than promises/async-await.

## Data model

```mermaid
erDiagram
    USER ||--o{ ACCOUNT     : owns
    USER ||--o{ CATEGORY    : owns
    USER ||--o{ EXPENSE     : owns
    USER ||--o{ INCOME      : owns
    USER ||--o{ TRANSFER    : owns
    USER ||--o{ LOAN        : owns
    USER ||--o{ CURRENCY    : owns

    ACCOUNT  ||--o{ EXPENSE  : "paid from"
    ACCOUNT  ||--o{ INCOME   : "received to"
    ACCOUNT  ||--o{ TRANSFER : "from/to"
    CATEGORY ||--o{ EXPENSE  : classifies
    CATEGORY ||--o{ INCOME   : classifies
    CURRENCY ||--o{ EXPENSE  : "denominated in"
    CURRENCY ||--o{ INCOME   : "denominated in"

    USER {
        string externalId
        string emailAuthorized
        bool   userEnabled
        array  accessTokens
    }
    EXPENSE {
        string  description
        date    dueDate
        number  amount
        number  amountPaid
        string  status
        array   detail
        ref     account_id
        ref     category_id
        ref     currency_id
        ref     user_id
    }
```

Notes:
- Every domain document carries a `user_id`; ownership is enforced by `utilsService.ensureObjectUser` before mutating endpoints.
- `expense.detail` / `income.detail` are embedded line-item arrays, allowing a single transaction to split across categories.
- Accounts and categories use a soft-delete (active flag) rather than removing rows.

## Authentication flow

```mermaid
sequenceDiagram
    participant U as User
    participant SPA as AngularJS SPA
    participant API as Express
    participant G as Google OAuth2
    participant DB as MongoDB

    U->>SPA: Click "Sign in with Google"
    SPA->>API: GET /auth/google
    API->>G: Redirect with client_id, scope
    G-->>U: Consent screen
    U->>G: Approve
    G->>API: GET /auth/google/callback?code=...
    API->>G: Exchange code for profile
    API->>DB: usersService.logIn — upsert user, push new token
    API-->>SPA: Redirect with id, email, token, name, photo
    SPA->>SPA: indexController stores in localStorage
    Note over SPA,API: All later requests carry<br/>Authorization: <token>, User-Id: <id>
    SPA->>API: GET /api/expenses (with headers)
    API->>API: utilsService.ensureAuth — verify user enabled<br/>+ token present in user.accessTokens
    API->>DB: query
    DB-->>API: rows
    API-->>SPA: JSON
```

Tokens are opaque random strings stored in an array on the user document, so multi-device sessions and revocation are both possible. Admin-only endpoints additionally check `emailAuthorized` against `USERS_API_ADMIN_EMAIL`.

## SPA structure

| Concern        | Location                          |
| -------------- | --------------------------------- |
| Routing & DI   | `static/js/app.js`                |
| Page templates | `static/html/*.html` (19 files)   |
| Controllers    | `static/js/controllers/*.js`      |
| API clients    | `static/js/services/*.js`         |
| HTTP plumbing  | `static/js/interceptors/*.js`     |

Routes mirror the backend resources (`/expenses`, `/incomes`, `/accounts`, `/categories`, `/transfers`, `/loans`, `/currencies`) plus `/`, `/login`, `/logoff`. Two `$http` interceptors handle cross-cutting concerns:

- `authorizationHeaderInterceptor` injects `Authorization` and `User-Id` from `localStorage` into every outbound request.
- `unauthorizedInterceptor` redirects to `/login` on 401.

A `serviceWorker.js` and `manifest.json` are present, suggesting limited PWA support.

## Deployment

```mermaid
flowchart LR
    subgraph dev[Local — docker-compose.yml]
        webDev[web<br/>build: ./docker/web<br/>volume: . → /web<br/>env_file: .env]
        mongoDev[(mongodb:8.0.9<br/>volume: ./backups)]
        webDev <--> mongoDev
    end

    subgraph prod[Server — docker-compose-server.yml]
        webProd[web<br/>restart: unless-stopped<br/>inline env vars]
        mongoProd[(mongodb:8.0.9<br/>volume: /opt/finance-control/data/db<br/>restart: unless-stopped)]
        webProd <--> mongoProd
    end
```

The two compose files diverge on three things: env source (`.env` file vs inline), source-code mounting (dev mounts the repo for live reload; prod uses the baked image), and Mongo persistence path. Both wire the services on a `fc-network` bridge.

## Request shape

Most endpoints follow the same pattern, e.g. `POST /api/expenses`:

```mermaid
sequenceDiagram
    participant SPA
    participant Express as expensesApi
    participant Mw as utilsService.ensureAuth
    participant Svc as expensesService
    participant Schema as jsonschema
    participant DB as MongoDB

    SPA->>Express: POST /api/expenses + headers + body
    Express->>Mw: validate token + user
    Mw->>DB: usersService.getById
    DB-->>Mw: user
    Mw-->>Express: next()
    Express->>Svc: create(userId, body)
    Svc->>Schema: validate(body, expenseSchema)
    Schema-->>Svc: ok
    Svc->>DB: ExpenseModel.save
    DB-->>Svc: doc
    Svc-->>Express: callbackSuccess
    Express-->>SPA: 200 "OK"
```

## Folder map

```
finance-control/
├── server.js                  # Express bootstrap, route registration
├── package.json               # Node 18, no build/test scripts
├── docker-compose.yml         # local dev
├── docker-compose-server.yml  # production
├── docker/web/                # Dockerfile for the Node image
├── api/
│   ├── apis/                  # 11 route modules
│   ├── services/              # 11 service modules (incl. utilsService)
│   └── models/                # 8 Mongoose schemas
├── static/
│   ├── index.html             # SPA shell
│   ├── manifest.json
│   ├── serviceWorker.js
│   ├── js/                    # app.js, controllers, services, interceptors
│   ├── html/                  # 19 templates (pages + modals)
│   ├── css/, images/
│   └── bower_components/      # vendored frontend deps
└── backups/                   # mounted into the Mongo container
```

## Observations and improvement opportunities

Worth raising before any rework:

1. **AngularJS 1.x is end-of-life.** The frontend is the largest single liability; a migration target (Vue, Svelte, React) should be picked before adding more pages.
2. **Frontend deps are vendored via Bower.** Switching to npm + a small bundler is a prerequisite for #1.
3. **Tokens in `localStorage`.** Vulnerable to XSS exfiltration. `httpOnly` cookies + CSRF token would be a stronger default.
4. **Callback-based services.** The whole `api/services` layer predates async/await; converting to promises would simplify error handling and remove the deeply nested `callbackSuccess`/`callbackError` argument lists.
5. **`password-hash` is imported but unused.** Login is Google-only; the dependency can be dropped.
6. **No tests, no CI, no linter.** `npm start` is the only script. A small Jest/Vitest suite around services and a basic GitHub Actions workflow would be high-leverage.
7. **No rate limiting or input sanitization beyond schema.** `express-rate-limit` and `helmet` would close obvious gaps.
8. **Single hard-coded admin** (`USERS_API_ADMIN_EMAIL`). A `role` field on the user document scales better than an env var.
9. **No API documentation.** Endpoint contracts live only in code; an OpenAPI spec (or at least a README of routes) would help any future client work.
10. **Mixed locale.** Status enums are in Portuguese (`Em aberto`, `Pago`) while route names are English; worth standardising.
