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
