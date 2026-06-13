# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

42-transcendence is a containerized microservices platform for multiplayer Pong (SkyPong). All external traffic enters through a TLS NGINX gateway at `https://localhost:8443`. Each domain service owns its own SQLite database. The full stack is managed with Docker Compose and a `Makefile`.

## Commands

### Full-stack (Docker Compose)

```bash
make config        # Generate .env + docker-compose.yml from templates (run once after clone)
make up            # Start all services (detached)
make down          # Stop all services
make all           # clean + config + build + up (full reset)
make hall          # clean-hard + config + build + up (destroys volumes/data too)
make rebuild       # Build without cache and restart
make logs          # Follow logs for all services
make ps            # Container status
make exec-nginx    # Shell into nginx-gateway
make exec-auth     # Shell into auth-service
make exec-game     # Shell into game-service
```

### Local service development (without Docker)

```bash
# Run any backend service locally
cd auth-service && npm install && npm run dev       # port 8081
cd profile-service && npm install && npm run dev   # port 5000
cd statistics-service && npm install && npm run dev # port 6000

# Next.js frontend
cd front && npm install && npm run dev             # port 3000

# Build a service
npm run build    # compiles TypeScript to dist/
```

There are no test suites configured (services return `exit 1` for the `test` script).

## Architecture

### Service map

| Service | Tech | Internal port |
|---|---|---|
| `nginx-gateway` | NGINX (TLS) | 8443 (external) |
| `auth-service` | Fastify + TypeScript + SQLite | 8081 |
| `profile-service` | Fastify + TypeScript + SQLite | 5000 |
| `statistics-service` | Fastify + TypeScript + SQLite | 6000 |
| `game/server` | Colyseus + TypeScript | 2567 |
| `game/client` | React + Vite + Babylon.js | served at `/game-engine/` |
| `front` | Next.js 16 + React 19 + TypeScript | 3000 |

### NGINX routing (nginx-gateway/nginx.conf)

- `/api/auth/*` → auth-service `/auth/*`
- `/api/profile/*` → profile-service (requires auth subrequest via `/_internal/auth_verify`)
- `/api/statistics/*` → statistics-service (auth-protected)
- `/api/game/*` and `/ws/*` → game-service (Colyseus WebSockets)
- `/api/chat/ws` → profile-service WebSocket chat
- `/game-engine/` → game-frontend container
- `/*` → Next.js frontend

Auth verification for protected routes is delegated to `/_internal/auth_verify` (an internal-only NGINX location proxied to `auth-service /auth/verify`).

### Auth flow

- JWT-based with separate access and refresh tokens, both stored as `httpOnly secure sameSite=none` cookies.
- CSRF double-submit cookie pattern: frontend reads `csrf_token` cookie and sends it as `x-csrf-token` header.
- `front/app/api/api.js` is the shared fetch wrapper — it handles 401 by auto-refreshing once before retrying.
- `front/app/context/auth-context.tsx` (`AuthProvider`) is the global auth state; use `useContext(AuthContext)` throughout the frontend.

### Service-to-service communication

Services call each other using the `SERVICE_TOKEN` env var in an `x-service-token` header. `AUTH_SERVICE_URL`, `PROFILE_SERVICE_URL`, and `STATS_SERVICE_URL` are configured via environment variables.

### Game package layout

`game/` is an npm workspace monorepo:
- `game/common` — shared TypeScript types, constants, and base entities used by both server and client.
- `game/server/src_serv` — Colyseus rooms (`GameRoom`, `PvpRoom`, `AIGameRoom`), physics, entities, AI controller.
- `game/client/src_cli` — React/Babylon.js client rendering, Colyseus client connection, game UI.

### Frontend structure (front/app/)

- `api/api.js` — central fetch wrapper with auto-refresh logic.
- `context/` — `AuthProvider` and `LanguageProvider` (wrap the entire app in `layout.js`).
- `lib/i18n/` — locale files (`en.ts`, `es.ts`, `it.ts`) and a `locale-manager.ts`; language is determined server-side in the root layout and passed via `LanguageProvider`.
- `ui/` — all reusable React components (navigation, profile cards, leaderboard, chat, etc.).
- `hooks/` — custom React hooks.
- Route pages: `login/`, `signup/`, `me/`, `updateme/`, `play/`, `[id]/` (public profile), `launch/`, `game-mode/`, `canvas/`.

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `JWT_SECRET` — generate with `openssl rand -hex 64`
- `SERVICE_TOKEN` — shared secret for internal service calls
- `ENCRYPTION_KEY` — used for sensitive data at rest
- `DATABASE_URL` — SQLite path (set automatically by Docker volumes)

`make config` will create `.env` from the example if it doesn't exist and generate `docker-compose.yml` from `docker-compose-template.yml` (substituting host volume paths).

## Key Conventions

- Backend services use **Fastify v5** with TypeScript; route handlers and DB access are in separate files (e.g., `src/player.ts` contains route logic, `src/database/dbPlayers.ts` contains SQL).
- Each service generates its own RSA key pair for JWT signing (`src/keys.ts` / `scripts/generate-keys.cjs`).
- The frontend uses **Tailwind CSS v4** (PostCSS plugin, not the CLI), `clsx`/`tailwind-merge` for conditional classes, `zod` for form validation with `react-hook-form`, and **Font Awesome** for icons.
- i18n is handled without URL prefixes — `getCurrentLocale()` in `layout.js` picks the locale from browser/cookie state and passes it down via `LanguageProvider`.
- `make clean` removes the generated `docker-compose.yml`; always run `make config` before `make up` on a fresh checkout or after a hard clean.
