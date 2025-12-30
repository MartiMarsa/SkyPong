const fastify = require("fastify")({ logger: true });

const PORT = Number(process.env.PORT || 4000);

// Metrics (Prometheus)
fastify.register(require("fastify-metrics"), {
  endpoint: "/metrics",
});

// --------------------
// Health
// --------------------
fastify.get("/healthz", async () => ({ ok: true, service: "game-service" }));

// --------------------
// In-memory mock state
// --------------------
const rooms = new Map(); // roomId -> { state, updatedAt }
const tickets = new Map(); // ticket -> { roomId, userId, createdAt, status }

function now() {
  return Date.now();
}

function getRoom(roomId = "lobby") {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      updatedAt: now(),
      state: {
        roomId,
        players: [],
        paddles: {}, // { [player]: { up:boolean, down:boolean } }
        ball: { x: 0.5, y: 0.5, vx: 0.01, vy: 0.008 },
        score: { left: 0, right: 0 },
        lastEvent: { type: "init", at: now() },
      },
    });
  }
  return rooms.get(roomId);
}

// Simple ticker mock (moves ball only when there are players)
setInterval(() => {
  for (const room of rooms.values()) {
    const s = room.state;
    if (!s.players || s.players.length === 0) continue;

    const b = s.ball;
    b.x += b.vx;
    b.y += b.vy;

    if (b.y <= 0 || b.y >= 1) b.vy *= -1;
    if (b.x <= 0) {
      s.score.right += 1;
      b.x = 0.5; b.y = 0.5;
      s.lastEvent = { type: "score", side: "right", at: now() };
    }
    if (b.x >= 1) {
      s.score.left += 1;
      b.x = 0.5; b.y = 0.5;
      s.lastEvent = { type: "score", side: "left", at: now() };
    }

    room.updatedAt = now();
  }
}, 50);

// --------------------
// REST API (Mock)
// --------------------

// Get current room state
// GET /room/state?room=lobby
fastify.get("/room/state", async (req) => {
  const roomId = (req.query && req.query.room) || "lobby";
  const room = getRoom(roomId);
  return { ok: true, state: room.state, updatedAt: room.updatedAt };
});

// Join room (adds player)
// POST /room/join  { roomId, player }
fastify.post("/room/join", async (req, reply) => {
  const body = req.body || {};
  const roomId = body.roomId || "lobby";
  const player = body.player || `guest_${Math.random().toString(16).slice(2, 8)}`;

  const room = getRoom(roomId);
  if (!room.state.players.includes(player)) room.state.players.push(player);

  room.state.lastEvent = { type: "join", player, at: now() };
  room.updatedAt = now();

  reply.code(201);
  return { ok: true, roomId, player, state: room.state };
});

// Leave room (removes player)
// POST /room/leave { roomId, player }
fastify.post("/room/leave", async (req) => {
  const body = req.body || {};
  const roomId = body.roomId || "lobby";
  const player = body.player;

  const room = getRoom(roomId);
  if (player) {
    room.state.players = room.state.players.filter((p) => p !== player);
    delete room.state.paddles[player];
    room.state.lastEvent = { type: "leave", player, at: now() };
    room.updatedAt = now();
  }

  return { ok: true, roomId, players: room.state.players };
});

// Input (mock)
// POST /input { roomId, player, input: {up:boolean, down:boolean} }
fastify.post("/input", async (req) => {
  const body = req.body || {};
  const roomId = body.roomId || "lobby";
  const player = body.player || "anon";
  const input = body.input || {};

  const room = getRoom(roomId);

  if (!room.state.players.includes(player)) {
    room.state.players.push(player);
  }

  room.state.paddles[player] = {
    up: Boolean(input.up),
    down: Boolean(input.down),
  };

  room.state.lastEvent = { type: "input", player, input: room.state.paddles[player], at: now() };
  room.updatedAt = now();

  return { ok: true };
});

// Reset room state
// POST /room/reset { roomId }
fastify.post("/room/reset", async (req) => {
  const body = req.body || {};
  const roomId = body.roomId || "lobby";
  const room = getRoom(roomId);

  room.state.ball = { x: 0.5, y: 0.5, vx: 0.01, vy: 0.008 };
  room.state.score = { left: 0, right: 0 };
  room.state.lastEvent = { type: "reset", at: now() };
  room.updatedAt = now();

  return { ok: true, state: room.state };
});

// Matchmaking mock
// POST /matchmaking/join { userId, roomId? }
fastify.post("/matchmaking/join", async (req) => {
  const body = req.body || {};
  const userId = body.userId || "anon";
  const roomId = body.roomId || "lobby";

  const ticket = `ticket_${now()}_${Math.random().toString(16).slice(2, 8)}`;
  tickets.set(ticket, { ticket, userId, roomId, createdAt: now(), status: "searching" });

  // mock: auto-match after a short delay
  setTimeout(() => {
    const t = tickets.get(ticket);
    if (!t) return;
    t.status = "matched";
    t.matchedAt = now();
  }, 800);

  return { ok: true, ticket };
});

// GET /matchmaking/status?ticket=...
fastify.get("/matchmaking/status", async (req, reply) => {
  const ticket = req.query && req.query.ticket;
  if (!ticket || !tickets.has(ticket)) {
    reply.code(404);
    return { ok: false, error: "ticket_not_found" };
  }
  return { ok: true, ...tickets.get(ticket) };
});

// --------------------
// Start
// --------------------
fastify.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
