# AGENTS.md

## Intro

This file provides guidelines for agentic coding agents (such as Copilot, Cursor, etc.) operating in this repository. 42-transcendence is a TypeScript/Node.js monorepo with Fastify, Colyseus game server, Next.js frontend, and service decomposition. High-quality, robust, and strictly-typed code is required. This guide standardizes build/test/lint commands, code style, TypeScript/ESLint practices, naming, imports, error handling, and monorepo conventions.

---

## 1. BUILD, LINT & TEST COMMANDS

### Monorepo Structure
- Each service or core (game/server, statistics-service, profile-service, etc.) has its own `package.json` and usually a `tsconfig.json`.
- Use commands locally in each service directory unless specified.

### Build Commands
- __Game server__: `cd game/server && npm run build`
- __Statistics-service__: `cd statistics-service && npm run build`
- __Frontend__: `cd front && npm run build`
- Common code: `cd game/common && npm run build` or `tsc -b` in root

### Lint Commands
- ESLint and Prettier are recommended at service level. If present, run `npm run lint`.
- Code must pass `tsc --strict` (enabled in most tsconfigs).
- Preferred ESLint configs: Airbnb, typescript-eslint, or strict community set.
- Add lint/test scripts if missing for future agent/human benefit.

### Test Commands
- **No test scripts present by default.**
- Add `/tests` or `/src/__tests__` for local/unit/integration tests in each service.
- Recommendation: Add `"test": "jest"` or similar script to each package.json.
- To run a single test file:
  ```bash
  npm test -- src/something.spec.ts
  # or
  npx jest src/something.spec.ts
  ```

---

## 2. CODE STYLE GUIDELINES

### TypeScript
- Use `.ts` for all source; avoid `.js` for app logic.
- Set `strict: true` in all tsconfigs.
- Prefer interface/explicit types for all public APIs, DTOs, and contract shapes.
- Use `export type` for union/intersection/type ops, `export interface` for DTOs and contracts.
- Enable and use `esModuleInterop`.

### Imports/Exports
- Always use ES6 `import ... from` in TypeScript.
- Group imports: external libs, then internal modules/types.
- Use path aliases (`@skypong/common/...` etc.) as supported by tsconfig.
- One class/type per file unless a clearly-linked group/type.

### Formatting & Structure
- Use Prettier: 2-space indent, trailing commas where allowed, single quotes if possible.
- Alphabetize imports: external, then internal.
- Type interfaces at top of file.
- Export named entities unless project requires a default export (Next.js, etc.).

### Naming Conventions
- Classes & types: `PascalCase` (e.g., `GameStats`)
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- File names: `camelCase` (prefer) or `PascalCase`
- Async functions: use `Async` suffix

### Error Handling
- Always wrap external system/IO calls in `try/catch`.
- Never silently swallow errors! Always log with details and preserve stack.
- Prefer custom error types for cross-service boundaries.
- If enriching errors, add context data or error codes.

### Documentation & Comments
- Every exported function, class, and interface must have a JSDoc comment.
- Comment non-obvious logic and every business/data contract.
- Update/fix code comments as code evolves.

### APIs and DTOs
- Use explicit, versionable DTOs for service boundaries.
- For statistics-service, see POST `/internal/statistics/gameresult/update` with:
  ```json
  {
    "game_id": "string",
    "start_at": "string",
    "end_at": "string",
    "players": [
      { "user_id": "string", "user_score": 0, "user_result": "win"|"loss" }
    ]
  }
  ```

### Environments and Secrets
- Service secrets/config must always be loaded via `.env`; see and maintain `.env.example`.
- Never commit real secrets or sensitive values—set only example keys in public files.
- Always safely use process.env, type-check as needed.

### Docker & Infrastructure
- Each service has its Dockerfile; preserve structure when extending.
- Do not modify/comingle persistent volumes/ports unexpectedly.
- Pass secrets only via env vars.

### General Agentic Rules
- Do NOT auto-run prune/purge commands; warn or require confirmation.
- Never commit files with secrets (.env, etc.).
- Add PR comments (`## AGENT NOTE`) for codegen/non-human code.
- If there is a conflict with .github/CODEOWNERS or CONTRIBUTING.md, escalate to human review.
- Large/multi-file changes should be structured as small, testable PRs.

### Best-Practice TypeScript Rules (typescript-eslint, summary)
- Prefer interfaces over type aliases unless unions needed.
- Never use `any`; use `unknown` for unknown types.
- Strict null checks.
- Avoid top-level side effects unless required.
- Require explicit return types for exports.
- Remove all unused variables.
- No circular dependencies/import cycles.
- Use readonly types for all DTOs where feasible.

---

## 3. TEMPLATE/QUICKSTART
- For new services:
  - Use `npm init` or `yarn init`.
  - Copy structure from game/server or statistics-service.
  - Add a README and tsconfig inheriting monorepo defaults.
  - Add at least one real test under `/tests` or `/src/__tests__`.

---

# End of AGENTS.md
