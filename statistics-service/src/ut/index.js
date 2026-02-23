const fastify = require("fastify")({ logger: true });

const PORT = Number(process.env.PORT || 6000);

fastify.register(require("fastify-metrics"), { endpoint: "/metrics" });

fastify.get("/healthz", async () => ({ ok: true, service: "statistics-service" }));

const stats = new Map();

function defaultStats(id) {
  return {
    id,
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    lastMatchAt: null,
  };
}

fastify.get("/statistics/:id", async (req, reply) => {
  const { id } = req.params;
  if (!id) {
    reply.code(400);
    return { ok: false, error: "missing_id" };
  }

  if (!stats.has(id)) {
    stats.set(id, defaultStats(id));
  }

  return { ok: true, statistics: stats.get(id) };
});

fastify.post("/statistics/:id/match", async (req, reply) => {
  const { id } = req.params;
  if (!id) {
    reply.code(400);
    return { ok: false, error: "missing_id" };
  }

  const body = req.body || {};
  const result = body.result;

  if (!result || !["win", "loss"].includes(result)) {
    reply.code(400);
    return { ok: false, error: "invalid_result" };
  }

  const current = stats.get(id) || defaultStats(id);
  const updated = {
    ...current,
    wins: current.wins + (result === "win" ? 1 : 0),
    losses: current.losses + (result === "loss" ? 1 : 0),
    gamesPlayed: current.gamesPlayed + 1,
    lastMatchAt: new Date().toISOString(),
  };

  stats.set(id, updated);
  return { ok: true, statistics: updated };
});

fastify.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
