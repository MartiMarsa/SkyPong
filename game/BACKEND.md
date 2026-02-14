# SkyPong Backend Architecture

## Table of Contents
1. Overview
2. Frameworks & Technologies
   2.1 Technology Stack
   2.2 Docker Structure and Deployment
3. Room-based Multiplayer Architecture
4. State Synchronization
5. Server-side Physics & Entities
6. Input Aggregation
7. AI Paddle Controller
8. Room Lifecycle & Disposal
9. Configuration & Constants
10. Client-to-Server Connection & Communication Flow

---

## 1. Overview
SkyPong's backend is a real-time multiplayer game server, written in TypeScript, leveraging [Colyseus](https://colyseus.io/) for networking and room management. All physics and game logic are handled authoritatively on the server, ensuring fairness and preventing cheating.

---

## 2. Frameworks & Technologies
### 2.1 Technology Stack
- **Colyseus** – Multiplayer game server framework, manages rooms/sessions.
- **TypeScript** – Strict typing for robust code.
- **Babylon.js** (NullEngine) – Physics engine in headless mode, no rendering.
- **Node.js** – Server runtime environment.

**Main entry point:** [`server/src_serv/index.ts`](server/src_serv/index.ts)
```ts
const app = express();
const gameServer = new Server({
    transport: new WebSocketTransport({
        server: createServer(app),
    }),
});
// Register rooms
gameServer.define("game_room", GameRoom);
gameServer.define("ai_game_room", AIGameRoom);
gameServer.define("pvp_room", PvpRoom).enableRealtimeListing();
gameServer.listen(SERVER_CONFIG.PORT, "0.0.0.0");
```

### 2.2 Backend Dockerization, Deployment & Production Infrastructure

SkyPong's backend is designed for cloud-native deployment using Docker and Docker Compose, with support for internet exposure via Cloudflare Tunnel in restrictive NAT environments.

#### Prerequisites
- Docker (v20+) and Docker Compose installed on your server/NAS
- Node.js 18+ and npm (for local development/override)
- SSH access to deploy server
- [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) installed (for HTTPS/WebSocket tunnel)
- Recommend: Ubuntu, Debian, or similar Linux environment

#### Backend Container/Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│  ┌──────────────────┐      ┌──────────────────────┐    │
│  │   skypong-client  │      │   skypong-server      │    │
│  │   (nginx)        │      │   (Node.js)          │    │
│  │   Port 80        │      │   Port 2567          │    │
│  │  Static React    │      │   WebSocket Server   │    │
│  └──────────────────┘      └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         ↑                         ↑
   cloudflared               cloudflared
   tunnel :80                tunnel :2567
         ↑                         ↑
   Cloudflare                Cloudflare
   Edge                      Edge
         ↑                         ↑
         Internet Access For Clients
```

#### Key Files
- `Dockerfile.server` — Multi-stage build for Colyseus backend, execs on port 2567
- `docker-compose.yml` — Orchestrates both skypong-server & skypong-client

#### Quick Start Backend Deployment (with Cloudflare tunnel)

1. **SSH into Your Server**

    ```bash
    ssh username@your-server-ip
    ```

2. **Clone or Copy SkyPong Code**
3. **Build & Launch Containers**
    ```bash
    cd ~/skypong
    sudo docker compose up -d
    ```
    - Exposes backend on :2567 inside Docker network
4. **(Recommended/NAT environment) Start Cloudflare Tunnel**
    - Install cloudflared if needed ([see below](#cloudflared-installation))
    - Open two SSH sessions to keep tunnels alive:
      - **Session 1:**
        ```bash
        cloudflared tunnel --url http://localhost:2567
        ```
      - **Session 2:**
        ```bash
        cloudflared tunnel --url http://localhost:80
        ```
    - You’ll get two URLs with `https://…trycloudflare.com` you can share. Each session must remain open.
5. **Update docker-compose for correct WebSocket URL**
    - In the web client build args section (`docker-compose.yml`):
      ```yaml
      args:
        VITE_SERVER_HOST: your-websocket-tunnel.trycloudflare.com  # no scheme
        VITE_SERVER_PORT: "443"
        VITE_WS_PROTOCOL: wss
      ```
    - Rebuild client after updating these values:
      ```bash
      sudo docker compose build --no-cache skypong-client
      sudo docker compose up -d skypong-client
      ```

#### docker-compose Server Section (excerpt)
```yaml
  skypong-server:
    build:
      context: .
      dockerfile: Dockerfile.server
    container_name: skypong-server
    ports:
      - "2567:2567"        # Colyseus backend
    environment:
      - PORT=2567
      - DEBUG_MODE=false
    restart: unless-stopped
    networks:
      - skypong-network
```

#### Dockerfile.server Highlights
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY common/package.json ./common/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm install
COPY common/ ./common/
COPY server/ ./server/
WORKDIR /app/common
RUN npx tsc --skipLibCheck
WORKDIR /app/server
RUN npx tsc --skipLibCheck
FROM node:20-alpine AS production
WORKDIR /app
COPY package.json package-lock.json* ./
COPY common/package.json ./common/
COPY server/package.json ./server/
RUN npm install --omit=dev --workspace=server --workspace=common
COPY --from=builder /app/common/ ./common/
COPY --from=builder /app/server/dist/ ./dist/
EXPOSE 2567
CMD ["node", "dist/server/src_serv/index.js"]
```

---

#### Cloudflared Installation

**Ubuntu/Debian (amd64):**
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
```

See the [official guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) for more OSes.

---

#### Docker & Deployment Command Cheat Sheet
```bash
# Start containers
docker compose up -d
# Stop containers
docker compose down
# Rebuild after code changes
git pull
docker compose up -d --build
# Status
docker compose ps
# Logs
docker compose logs -f
# Backend logs only
docker compose logs skypong-server
# Remove Docker cache (if errors)
docker system prune -af
docker volume prune -f
```

---

#### Troubleshooting
- **Backend not reachable**: Ensure `skypong-server` is running; check with `docker compose logs skypong-server`.
- **WebSocket connection fails**: Double-check `VITE_SERVER_HOST` in the web client args uses the correct tunnel URL (no https:// prefix).
- **Firewall or NAT issues**: Use Cloudflare tunnel; port forwarding may not work with CGNAT.
- **Build errors** ("parent snapshot does not exist", etc):
    ```bash
    docker compose down
    docker system prune -af
    docker volume prune -f
    docker compose build --no-cache
    docker compose up -d
    ```
- **Client or server URLs change on every restart**: Obtain new tunnel URLs, update build args, and rebuild client.
- For permanent, custom URLs: Set up named tunnels and domains in Cloudflare (see Cloudflare documentation).

---

## 3. Room-based Multiplayer Architecture
The server organizes gameplay into *rooms* (Colyseus concept), each governing its own match with associated state and logic. Main room types:
- **GameRoom**: Local 1v1
- **AIGameRoom**: Single-player vs AI
- **PvpRoom**: Online PvP

Room setup example ([`server/src_serv/rooms/GameRoom.ts`](server/src_serv/rooms/GameRoom.ts)):
```ts
export class GameRoom extends Room<MyGameState> {
    onCreate(options: any): void {
        this.setState(new MyGameState());
        this.engine = new NullEngine();
        this.scene = new Scene(this.engine);
        this.physicsEngine = new PhysicsEngine(this.scene);
        this.serverTable = new ServerTable(this.scene);
        this.serverBall = new ServerBall(this.scene, this.physicsEngine);
        this.serverPaddle = new ServerPaddle(this.scene, this.physicsEngine, false);
        this.serverPaddle2 = new ServerPaddle(this.scene, this.physicsEngine, true);
        this.inputManager = new InputManager();
        this.onMessage("input", (client, data) => { ... });
        this.onMessage("launch", (client, data) => { ... });
        this.setSimulationInterval((dt) => { this.update(dt); }, SERVER_CONFIG.SIMULATION_INTERVAL_MS);
    }
}
```

---

## 4. State Synchronization
Game state is synchronized between all clients and the server using [Colyseus "Schema" objects](https://docs.colyseus.io/state/schema/).

Schema example ([`common/GameState.ts`](common/GameState.ts)):
```ts
export class MyGameState extends Schema {
    @type(BallState) ball = new BallState();
    @type(PaddleState) paddle = new PaddleState();
    @type(PaddleState) paddle2 = new PaddleState();
    @type("number") player1Score: number = 0;
    @type("number") player2Score: number = 0;
    @type("boolean") gameOver: boolean = false;
    @type("boolean") gameStarted: boolean = false;
}
```
Server mutates `MyGameState`, which Colyseus broadcasts efficiently as diffs to all clients.

---

## 5. Server-side Physics & Entities
Physics computations are performed using Babylon.js's NullEngine (headless, no rendering). Each entity is represented by a class:
- Ball: [`entities/ServerBall.ts`](server/src_serv/entities/ServerBall.ts)
- Paddle: [`entities/ServerPaddle.ts`](server/src_serv/entities/ServerPaddle.ts)
- Table: [`entities/ServerTable.ts`](server/src_serv/entities/ServerTable.ts)
- Physics core: [`physics/PhysicsEngine.ts`](server/src_serv/physics/PhysicsEngine.ts)

Physics tick sample ([`PhysicsEngine.ts`](server/src_serv/physics/PhysicsEngine.ts)):
```ts
public updateBall(body: BallBody, deltaTimeMs: number): void {
    body.mesh.position.addInPlace(body.velocity);
    if (body.isInFall) body.velocity.addInPlace(this.gravity);
    if (!body.isInFall && Math.abs(body.mesh.position.z) > ROOM_CONFIG.FALL_THRESHOLD_Z) body.isInFall = true;
    if (body.isInFall && body.mesh.position.y <= body.fallThreshold) this.disableBody(body);
}
```

---

## 6. Input Aggregation
Player inputs are received as messages and aggregated per-frame. InputManager example ([`server/src_serv/input/InputManager.ts`](server/src_serv/input/InputManager.ts)):
```ts
setInput(sessionId: string, data: any): void {
    this.inputMap[sessionId] = data;
}
getMovementVector(): Vector3 {
    this.moveDirection.set(0, 0, 0);
    for (let sessionId in this.inputMap) {
        const inputs = this.inputMap[sessionId];
        if (inputs["w"]) this.moveDirection.z += 1;
        // ...
    }
    return this.moveDirection;
}
```

---

## 7. AI Paddle Controller
The AI paddle for single-player is computed fully server-side:
- [`ai/AIPaddleController.ts`](server/src_serv/ai/AIPaddleController.ts)
- Difficulty settings: [`common/constants/AIConstants.ts`](common/constants/AIConstants.ts)

Sample ([`AIPaddleController.ts`](server/src_serv/ai/AIPaddleController.ts)):
```ts
export class AIPaddleController {
    constructor(paddle, ball, physics, difficulty) {
        this.settings = DIFFICULTY_SETTINGS[difficulty];
    }
    update() {
        // Decide new paddle target based on ball and difficulty
    }
}
```

---

## 8. Room Lifecycle & Disposal
Automatic room disposal and cleanup are configured to avoid resource leaks:
```ts
this.autoDispose = true; // Dispose room when all players disconnect
```
PvP Room starts expiration timer for lobbies ([`PvpRoom.ts`](server/src_serv/rooms/PvpRoom.ts)):
```ts
this.expirationTimer = setTimeout(() => {
    if (!this.player2Client) {
        // ...expire room
    }
}, 120000); // 2 minutes
```

---

## 9. Configuration & Constants
Centralized, shared constants ensure consistency:
- ServerConfig: [`server/src_serv/config/ServerConfig.ts`](server/src_serv/config/ServerConfig.ts)
- RoomConfig: [`server/src_serv/config/RoomConfig.ts`](server/src_serv/config/RoomConfig.ts)
- GameConstants: [`common/constants/GameConstants.ts`](common/constants/GameConstants.ts)
- NetworkConstants: [`common/constants/NetworkConstants.ts`](common/constants/NetworkConstants.ts)
- TimingConfig: [`server/src_serv/config/TimingConfig.ts`](server/src_serv/config/TimingConfig.ts)

Sample ([`ServerConfig.ts`](server/src_serv/config/ServerConfig.ts)):
```ts
export const SERVER_CONFIG = {
    PORT: 2567,
    SIMULATION_FPS: 60,
    SIMULATION_INTERVAL_MS: 16.66,
    DEBUG_MODE: false,
};
```

---

## 10. Client-to-Server Connection & Communication Flow
SkyPong uses Colyseus WebSockets for real-time messaging and state sync. Here's a step-by-step description:

### 10.1 Session Establishment
- Client initializes Colyseus client:
  ```ts
  const client = new Colyseus.Client(SERVER_CONNECTION.WS_URL); // client/src_cli/game/Game.ts
  ```
- Connects to server ws://localhost:2567 (or as configured).

### 10.2 Room Joining/Creation
- Client joins or creates a room (local, AI, PvP):
  ```ts
  room = await client.create<GameState>(SERVER_CONNECTION.ROOMS.PVP_ROOM, { playerName, playerColor });
  room = await client.joinOrCreate<GameState>(SERVER_CONNECTION.ROOMS.GAME_ROOM, { playerName, playerColor });
  ```
- Server creates room instance and invokes `onCreate()`:
  ```ts
  gameServer.define("pvp_room", PvpRoom)
  export class PvpRoom extends Room<MyGameState> { onCreate(options) { this.setState(new MyGameState()); ... } }
  ```

### 10.3 State Synchronization & Listeners
- Room state is Colyseus Schema (`MyGameState`). All changes propagate automatically:
  ```ts
  room.state.ball.onChange(() => { ... });
  room.state.paddle.onChange(() => { ... });
  room.state.listen('player1Score', cb);
  room.state.listen('gameStarted', cb);
  room.state.listen('player2Id', cb);
  ```
- Server-side:
  ```ts
  this.state.ball.x = ...;
  this.state.gameOver = true;
  ```

### 10.4 Input & Actions
- Client sends input every few frames via message:
  ```ts
  room.send("input", { w: pressedW, a: pressedA, ... });
  // server/src_serv/rooms/GameRoom.ts:
  this.onMessage("input", (client, data) => { this.inputManager.setInput(client.sessionId, data); });
  ```
- Other message types:
  - `launch`: triggers ball launch
  - `client_ready`: for PvP game sync

### 10.5 Game Events & Feedback
- Server processes input and emits events:
  ```ts
  client.send("room_expired", { message: "No opponent joined..." }); // server/src_serv/rooms/PvpRoom.ts
  room.onMessage('room_expired', ...); // client/src_cli/game/Game.ts
  ```

### 10.6 State Update Example
- Client receives ball, paddle, score updates via Schema listeners:
  ```ts
  room.state.ball.listen("collisionCount", ...);
  room.state.ball.onChange(() => { ... });
  room.state.paddle.onChange(() => { ... });
  room.state.paddle2.onChange(() => { ... });
  room.state.listen('player1Score', ...);
  room.state.listen('player2Score', ...);
  room.state.listen('winner', ...);
  room.state.listen('gameOver', ...);
  room.state.listen('gameStarted', ...);
  ```

### 10.7 Game Start & Synchronization (PvP)
- PvP room: clients signal ready with `client_ready`.
- Server tracks readiness; when `gameStarted` is set true, clients start countdown and gameplay.
- Code references:
  - `client_ready` & `gameStarted`: client/src_cli/game/Game.ts, server/src_serv/rooms/PvpRoom.ts, common/GameState.ts

---

**For further details, consult AGENTS.md or the referenced files.**
