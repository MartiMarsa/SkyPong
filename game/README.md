# SkyPong

A real-time 3D multiplayer pong game built with Babylon.js and Colyseus, featuring PBR rendering, server-authoritative physics, and multiple game modes.

## Features

- **Multiple game modes** -- AI opponents (easy / medium / hard), local 2-player split-screen, and online PvP with room-based matchmaking
- **PBR rendering** -- Physically Based Rendering pipeline with EXR environment maps, real-time shadows, refractive glass paddles, and PBR material system (albedo, normal, ORM maps). Significant research went into achieving realistic material rendering within Babylon.js, including environment-based lighting, refraction/transmission for glass materials, and proper metallic-roughness workflows
- **Server-authoritative architecture** -- All physics and game logic run on the server using Babylon.js NullEngine (headless), preventing cheating and ensuring fairness
- **Real-time state synchronization** -- Colyseus Schema-based state sync with client-side interpolation for smooth gameplay
- **Touch & mobile support** -- On-screen touch controls with automatic detection
- **Internationalization** -- UI available in English, Spanish, and Italian
- **Configurable matches** -- Selectable winning score (3, 5, 7, 9, 11) and camera views (angled, top-down)
- **Dockerized deployment** -- Multi-stage Docker builds for both client and server, with Cloudflare Tunnel support for NAT-restricted environments

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Client** | Babylon.js 8, React 18, Vite 5, TypeScript, Colyseus.js |
| **Server** | Colyseus 0.15, Babylon.js NullEngine (headless physics), Express, Node.js |
| **Shared** | `@skypong/common` -- Colyseus Schema definitions, physics constants, base entities |
| **Infrastructure** | Docker (multi-stage builds), nginx, Cloudflare Tunnel |

## Project Structure

```
game/
├── client/                     # Browser client (Vite + React + Babylon.js)
│   ├── public/                 # Static assets
│   │   ├── environment/        # EXR skybox / environment map
│   │   ├── textures/           # PBR texture sets (albedo, normal, ORM)
│   │   └── icons/              # UI icons (touch controls, pause)
│   └── src_cli/
│       ├── components/         # React pages (Canvas, Start, Loading)
│       ├── config/             # Rendering, materials, camera, UI, server connection
│       ├── entities/           # Client-side ball, paddle, table (visual meshes)
│       ├── factories/          # PBR material factory (dynamic texture loading)
│       ├── game/               # Game orchestration, loop, countdown, room management
│       ├── input/              # Keyboard input controller
│       ├── physics/            # Client-side interpolation engine
│       ├── rendering/          # Engine setup, scene lights, cloud objects
│       ├── types/              # Game session config, loading state types
│       ├── ui/                 # HUD, pause overlay, game over overlay, touch controls
│       └── utils/              # Camera utilities, config decoder, touch detection
│
├── server/                     # Authoritative game server (Colyseus + Babylon.js NullEngine)
│   └── src_serv/
│       ├── ai/                 # AI paddle controller with 3 difficulty levels
│       ├── config/             # Server, room, and timing configuration
│       ├── data/               # Game statistics reporting
│       ├── entities/           # Server-side ball, paddle, table (physics bodies)
│       ├── input/              # Input aggregation from connected clients
│       ├── physics/            # Server-side physics engine (collisions, movement)
│       └── rooms/              # Room types: GameRoom, AIGameRoom, PvpRoom
│
├── common/                     # Shared package (@skypong/common)
│   ├── GameState.ts            # Colyseus Schema (ball, paddles, scores, game state)
│   ├── constants/              # Game, physics, AI, network, scoring, timing constants
│   └── entities/               # Base entity classes (BaseBall, BasePaddle, BaseTable)
│
├── docker-compose.yml          # Orchestrates client + server containers
├── Dockerfile.client           # Multi-stage build: Vite → nginx
├── Dockerfile.server           # Multi-stage build: TypeScript → Node.js
└── nginx.conf                  # SPA routing for the client
```

## Architecture

```
┌─────────────────────────┐         WebSocket (Colyseus)         ┌──────────────────────────┐
│        CLIENT            │ ◄─────────────────────────────────► │         SERVER            │
│                          │                                      │                           │
│  Babylon.js renderer     │   Input messages (keyboard/touch)    │  Babylon.js NullEngine    │
│  PBR materials & lights  │ ────────────────────────────────►    │  (headless physics)       │
│  Interpolation engine    │                                      │                           │
│  React UI (HUD, menus)   │   State diffs (ball, paddles,       │  Collision detection      │
│  Touch controls          │   scores, game events)               │  Ball/paddle movement     │
│                          │ ◄────────────────────────────────    │  Scoring & game logic     │
│                          │                                      │  AI paddle controller     │
└─────────────────────────┘                                      └──────────────────────────┘
                                          │
                                 @skypong/common
                              (shared state schema,
                            constants, base entities)
```

The server is fully authoritative: clients send input, the server runs physics and game logic, then broadcasts state diffs. The client interpolates between server snapshots for smooth rendering.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Local Development

Install dependencies from the workspace root:

```bash
cd game
npm install
```

Then run the server and client in two separate terminals:

**Terminal 1 -- Server:**
```bash
cd game/server
npm start
```
The server starts on `ws://localhost:2567` with hot-reload via nodemon.

**Terminal 2 -- Client:**
```bash
cd game/client
npm run dev
```
The client starts on `http://localhost:5173` with Vite HMR.

This dev mode setup lets you iterate quickly -- the server reloads on file changes and the client hot-reloads in the browser.

### Docker Deployment

```bash
cd game
docker compose up -d
```

This builds and starts both containers:
- **skypong-client** -- nginx serving the built React app on port 80
- **skypong-server** -- Colyseus WebSocket server on port 2567

See [BACKEND.md](BACKEND.md) for detailed deployment instructions, Cloudflare Tunnel setup, and troubleshooting.

## Configuration

### Environment Variables (Client Build)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_SERVER_HOST` | `localhost` | Game server hostname |
| `VITE_SERVER_PORT` | `2567` | Game server port |
| `VITE_WS_PROTOCOL` | `ws` | WebSocket protocol (`ws` or `wss`) |
| `VITE_SERVER_PATH` | `/` | WebSocket path |
| `VITE_BASE_PATH` | `/` | Base URL path for the client |

### Game Session Options

| Option | Values | Description |
|--------|--------|-------------|
| `gameMode` | `ai-easy`, `ai-medium`, `ai-hard`, `local-2p`, `online-create`, `online-join` | Game mode |
| `winningScore` | `3`, `5`, `7`, `9`, `11` | Points needed to win |
| `cameraView` | `angled`, `top-down` | Camera perspective |
| `language` | `en`, `es`, `it` | UI language |

## Game Modes

| Mode | Room Type | Description |
|------|-----------|-------------|
| **AI (Easy/Medium/Hard)** | `ai_game_room` | Single player vs server-side AI with progressive difficulty degradation |
| **Local 2P** | `game_room` | Two players on the same device, top-down camera, split keyboard controls (A/D and J/L) |
| **Online PvP** | `pvp_room` | Two remote players, room-based matchmaking with lobby listing, 2-minute room expiration |

## PBR Rendering

The rendering pipeline uses Babylon.js's PBR material system with careful attention to physically accurate results. A significant amount of research and iteration went into tuning the rendering to achieve a visually convincing result:

- **Environment lighting** -- EXR cubemap (`dramatic-sky1.exr`) for image-based lighting and skybox reflections. Multiple HDRIs and environment formats were evaluated before settling on the final skybox
- **Material system** -- A `MaterialFactory` dynamically loads PBR texture sets (albedo, normal, ORM) with configurable UV scaling, metallic/roughness values, and ambient occlusion. The ORM (Occlusion-Roughness-Metallic) packed texture workflow was chosen for efficiency after testing individual channel approaches
- **Glass paddles** -- Refractive PBR materials with configurable index of refraction, tint color, and transparency. Getting physically plausible glass with proper refraction required experimenting with Babylon.js's sub-surface scattering and transmission parameters
- **Lighting rig** -- Hemispheric ambient + directional light with blur exponential shadow maps + point light for specular highlights. The multi-light setup was carefully balanced to complement the environment-based lighting without washing out material details
- **Cloud particles** -- Sprite-based volumetric cloud layer beneath the play field, adding depth to the scene
