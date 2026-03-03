# 42-transcendence
A galactic game of pong with steroids

## Integración del game-engine (SkyPong)

La orquestación principal ahora integra el contenido de `game/` dentro del stack general:

- `game-service`: servidor Colyseus real (build desde `game/Dockerfile.server`, puerto `2567`).
- `game-frontend`: frontend propio del engine (build desde `game/Dockerfile.client`).

### Rutas expuestas

- Gateway principal: `https://localhost:8443`
- Frontend del engine integrado detrás del gateway: `https://localhost:8443/game-engine/`
- WebSocket del engine vía gateway: `wss://localhost:8443/ws`

### Flujo recomendado

1. `make config`
2. `make up`
3. Abrir `https://localhost:8443/game-engine/` para validar el frontend del engine.

> Nota: se mantiene el frontend Next.js principal en `/`, para seguir integrando el engine gradualmente con el resto de pantallas del proyecto.


## Global realtime chat (minimal)

- Endpoint: authenticated WebSocket at `wss://localhost:8443/api/chat/ws`.
- Only one global room exists.
- No history is stored or replayed. You only receive messages while connected.
- Payload broadcast format: `{ sender, text, timestamp }`.

### Quick local test

1. Start stack:
   - `make config`
   - `make up`
2. Login in the web app at `https://localhost:8443`.
3. Open two authenticated browser tabs/windows.
4. Use the fixed chat panel (bottom-right) and send a message from one tab.
5. Confirm the other connected tab receives it in realtime.

If not authenticated, the chat panel is hidden and `/api/chat/ws` is rejected.
