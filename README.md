# 42-transcendence
A galactic game of pong with steroids

## Integración del game-engine (SkyPong)

La orquestación principal ahora integra el contenido de `game/` dentro del stack general:

- `game-service`:d desde `game/Dockerfile.server`, puerto `2567`).
- `game-frontend`: frontend propio del engine (build desde ` servidor Colyseus real (builgame/Dockerfile.client`).

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

## Monitoring compliance (Prometheus + Grafana)

### Start monitoring stack (one command)

```bash
make up
```

This starts Prometheus, Alertmanager, Grafana, cAdvisor and nginx-exporter from the same compose stack.

### What is provisioned automatically

- **Prometheus scrape config**: `prometheus/prometheus.yml`.
- **Alert rules**: `prometheus/rules/alerts.yml`.
- **Alertmanager config**: `alertmanager/alertmanager.yml`.
- **Grafana datasource** (Prometheus): `grafana/provisioning/datasources/datasource.yml`.
- **Grafana dashboards provider**: `grafana/provisioning/dashboards/dashboards.yml`.
- **Custom dashboards (JSON)**:
  - `System Overview (Transcendence)`
  - `Gateway (Nginx) Dashboard (Transcendence)`
  - `Microservices Latency (Transcendence)`

No manual import/click steps are required for reviewers.

### Dashboards and what they demonstrate

- **System Overview**: target health (`up`), container CPU/memory (cAdvisor), API throughput and latency (Fastify metrics).
- **Gateway (Nginx) Dashboard**: gateway exporter health, active connections, gateway request rate.
- **Microservices Latency**: top routes by traffic, p95/p99 latency, service error rates.

### Alerts and how to test one alert intentionally

Configured rules:
- `TargetDown` (critical): triggers when a scrape target is unavailable.
- `HighNginx5xxRate` (warning): triggers when gateway returns 5xx responses.
- `HighContainerCPU` (warning): triggers when container CPU stays high.

Simple reviewer test for `TargetDown`:

```bash
docker compose -p transcendence -f docker-compose.yml stop cadvisor
```

Wait ~30s, then verify in either:
- Prometheus alerts page: `http://localhost:9090/alerts`
- Alertmanager UI: `http://localhost:9093`

Bring it back:

```bash
docker compose -p transcendence -f docker-compose.yml start cadvisor
```

### Grafana security

- Anonymous access is disabled (`GF_AUTH_ANONYMOUS_ENABLED=false`).
- Self sign-up is disabled (`GF_USERS_ALLOW_SIGN_UP=false`).
- Admin credentials are required from environment variables:
  - `GRAFANA_ADMIN_USER`
  - `GRAFANA_ADMIN_PASSWORD`
- `make config` now writes these variables into `.env` (change them before production/public exposure).
