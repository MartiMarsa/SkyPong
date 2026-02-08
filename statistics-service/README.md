# Stat Service

This is a TypeScript-based statistics and leaderboard service built with Fastify.
It tracks game results between players, updates a leaderboard, and synchronizes with a profile service.

---

## Features

* Tracks game results between 2 players
* Stores statistics in SQLite
* Leaderboard with multiple indexes (rate, winrate, wins, played)
* Synchronization workers for statistics and leaderboard
* REST API for submitting game results and fetching leaderboard
* Token-based service authentication

---

## Prerequisites

* Node.js 20+
* npm
* Docker
* Git

---

## NPM Scripts

* npm run dev — Run in development mode with hot reload
* npm run build — Compile TypeScript to dist/
* npm start — Run the compiled JS from dist/

---

## Configuration & Security

* Service token for internal API access

  * Set via `SERVICE_TOKEN` environment variable (default: "secret" for local dev)
* SQLite databases:

  * `statistics.db` — Stores game results
  * `leaderboard.db` — Stores cached leaderboard data
* Database files are created automatically in the project root

---

## Docker Notes

* Container exposes port 6000
* Volume ./data persists SQLite databases
* Set `SERVICE_TOKEN` as environment variable inside container for security

---

## API Endpoints

### Add Game Result

* POST `/internal/statistics/gameresult/update`
* Headers: `Authorization: Bearer <SERVICE_TOKEN>`
* Body schema:

  * `game_id`: string
  * `start_at`: string
  * `end_at`: string
  * `players`: array of exactly 2 objects

    * `user_id`: string
    * `user_score`: number
    * `user_result`: "win" | "loss"

### Get Leaderboard

* GET `/statistics/leaderboard`
* Query params:

  * `by` — leaderboard index (`rate`, `winrate`, `wins`, `played`)
  * `limit` — number of results (default 50)
  * `offset` — offset for pagination (default 0)
* Response: `liderboard` array with fields:

  * `user_id`
  * `played`
  * `wins`
  * `losses`
  * `winrate`
  * `rate`
  * `updated_at`

---

## Database Structure

### Statistics DB (`statistics.db`)

* Table `games_and_results`:

  * `game_id`, `user1_id`, `user2_id`, `user1_score`, `user2_score`
  * `user1_result`, `user2_result`, `start_at`, `end_at`
  * `processed`, `processing`, `processed_at`, `created_at`

* Table `sync_state`:

  * `id`, `last_sync`

### Leaderboard DB (`leaderboard.db`)

* Table `leaderboard_cache`:

  * `user_id`, `played`, `wins`, `losses`, `winrate`, `rate`, `updated_at`

* Indexes on `rate`, `winrate`, `played`, `wins`

---

## Workers

### Statistics Worker

* Fetches unprocessed games from `games_and_results`
* Sends updates to Profile Service API
* Marks games as processed
* Runs in a loop with exponential backoff on errors

### Leaderboard Worker

* Fetches leaderboard updates from Profile Service API
* Updates `leaderboard_cache`
* Runs in a loop with exponential backoff on errors

---

## Setup & Run

1. Clone the repository:

git clone <repo-url>
cd stat-service

2. Install dependencies:

npm install

3. Run in development mode:

npm run dev

4. Or build and run production:

npm run build
npm start

5. Ensure `SERVICE_TOKEN` is set in your environment if using internal APIs.

---

## Shutdown

* The service handles `SIGINT` and `SIGTERM`
* Stops Fastify server
* Closes SQLite databases
* Stops statistics and leaderboard workers

---

## Notes

* Requires Profile Service for leaderboard synchronization
* Ensure both `statistics.db` and `leaderboard.db` are writable
* Default internal token is "secret"; change in production

