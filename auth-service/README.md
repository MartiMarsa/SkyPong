# Auth Service

This is a TypeScript-based authentication service built with Fastify.  
It supports JWT-based access tokens, refresh tokens, CSRF protection, and optional 2FA using TOTP.

---

## Features

- User signup and login
- JWT access tokens (RS256)
- Refresh tokens with DB storage
- CSRF protection
- 2FA (TOTP + QR code)
- Password hashing with Argon2
- SQLite persistence

---

## Prerequisites

- Node.js 20+
- npm
- Docker
- Git

---

## NPM Scripts

- npm run dev — Run in development mode with hot reload
- npm run build — Compile TypeScript to dist/
- npm start — Run the compiled JS from dist/
- npm run generate-keys — Generate JWT key pair (RSA 2048) if missing

---

## Keys & Security

- JWT keys (jwt-private.pem and jwt-public.pem) are required for token signing
- Keys are mounted into Docker container from host for persistence
- Do not commit private keys in production; for local development, they can be stored in the repo
- CSRF tokens are automatically issued per session

---

## Docker Notes

- Container exposes port 8081
- Volume ./data persists SQLite databases
- Keys are mounted into /app/ for access by the service

---

## API Endpoints

- POST /auth/signup — Create new user
- POST /auth/login — Login user
- POST /auth/password — Change password (authenticated)
- POST /auth/logout — Logout user
- POST /auth/refresh — Refresh access token
- POST /auth/2fa/setup — Generate 2FA secret + QR code
- POST /auth/2fa/enable — Enable 2FA for user
- POST /auth/2fa/verify — Verify 2FA code
- GET /auth/verify — Verify access token
- GET /health — Health check

---

Refresh tokens are stored in a SQLite table refresh_tokens

---

## Setup & Run (Automated)

Use a single script to fully setup and run the service:

```bash
git clone <repo-url>
cd auth-service
./setup-and-run.sh

---

## Clean up before you go or do git push (Automated)

Use a single script to clean up:

```bash
./clean-up.sh

