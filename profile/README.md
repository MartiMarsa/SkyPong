# Player Service

Player Service is a microservice built with Node.js, TypeScript, Fastify, and SQLite. It manages player profiles, avatars, and social interactions (friends, requests, blocks).

---

## Technologies

- Node.js
- TypeScript
- Fastify
- SQLite3
- Sharp
- ts-node-dev
- Chalk

---

## Architecture

The service uses layered architecture:

HTTP Routes (Fastify) → Service Layer → Repository Layer → SQLite Database

### Layers

Routes (index.ts)
- Handles HTTP requests
- Reads headers and params
- Calls services
- Returns responses

Service Layer (friendService.ts)
- Contains business logic
- Validates user actions
- Prevents invalid states
- Throws domain errors

Repository Layer (friend.ts, player.ts)
- Executes SQL queries
- Works directly with SQLite
- Returns raw data

Database Layer (dbPlayers.ts)
- Initializes database
- Creates tables
- Manages connection

---

## Database Structure

### players

user_id TEXT PRIMARY KEY  
nickname TEXT NOT NULL  
avatarUrl TEXT  
winPhrase TEXT  
localization TEXT  
created_at TEXT  

### friends

id INTEGER PRIMARY KEY  
user1_id TEXT  
user2_id TEXT  
status TEXT (pending, accepted, blocked)  
requester_id TEXT  
blocked_by TEXT  
created_at TEXT  

---

## Authentication

This service uses header-based authentication.

Client requests must include:
x-user-id: USER_ID

Internal service requests use:
Authorization: Bearer SERVICE_TOKEN

---

## Data Flow

### Friend Request Flow

1. Client sends request
2. Route reads userId from header
3. Service validates relation
4. Repository executes SQL
5. Database stores result
6. Response returned

### Profile Flow

1. User calls /me
2. Service checks database
3. Creates profile if missing
4. Returns player data

### Avatar Upload Flow

1. Client uploads file
2. Fastify validates size
3. Sharp resizes image
4. File saved to storage
5. Database updated

---

## API Endpoints

### Profile

GET /me — Get private profile  
PATCH /me — Update profile  
POST /me/avatar — Upload avatar  
GET /users/:id — Get public profile  

POST /internal/profile/delete — Delete profile (internal)

---

### Friends

POST /friends/:toId — Send friend request  
POST /friends/:requesterId/accept — Accept request  
POST /friends/:requesterId/reject — Reject request  
POST /friends/:requesterId/cancel — Cancel outgoing request  
DELETE /friends/:friendId — Remove friend  

POST /friends/:targetId/block — Block user  
POST /friends/:targetId/unblock — Unblock user  

GET /friends — Get friends list  
GET /friends/requests/incoming — Get incoming requests  
GET /friends/requests/outgoing — Get outgoing requests  
GET /friends/blocked — Get blocked users  
GET /friends/:otherId/status — Get relationship status  

---

## Error Handling

The service returns structured error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "ERROR_MESSAGE"
  }
}
```
---

## Common error codes:

UNAUTHORIZED
ALREADY_EXISTS
REQUEST_NOT_FOUND
ALREADY_FRIENDS
USER_BLOCKED
NOT_BLOCKED
NOT_FRIENDS
CANNOT_ADD_SELF
CANNOT_BLOCK_SELF

---

## Environment Variables

Create a .env file:
SERVICE_TOKEN=your_secret_token

---

## File Structure
src/
 ├── index.ts
 ├── dbPlayers.ts
 ├── player.ts
 ├── friend.ts
 ├── friendService.ts
uploads/
 └── avatars/
dist/

---

## Notes

SQLite is used for simplicity
All relations use normalized user IDs
Blocking overrides friend state
One relation per user pair
Foreign keys are enabled
Cascade delete is active

---

## Setup & Run (Automated)
Use a single script to fully setup and run the service:

git clone <repo-url>
cd profile
./setup-and-run.sh

---

## Clean up before you go or do git push (Automated)

Use a single script to clean up:

```bash
./clean-up.sh
```
---

## License
ISC
