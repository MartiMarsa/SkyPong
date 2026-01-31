const fastify = require("fastify")({ logger: true });

const PORT = Number(process.env.PORT || 5000);

fastify.register(require("fastify-metrics"), { endpoint: "/metrics" });

fastify.get("/healthz", async () => ({ ok: true, service: "profile-service" }));

const profiles = new Map();

function defaultProfile(id) {
  return {
    id,
    displayName: `player_${id.slice(0, 6)}`,
    avatarUrl: null,
    bio: "",
    updatedAt: new Date().toISOString(),
  };
}

fastify.get("/profiles/:id", async (req, reply) => {
  const { id } = req.params;
  if (!id) {
    reply.code(400);
    return { ok: false, error: "missing_id" };
  }

  if (!profiles.has(id)) {
    profiles.set(id, defaultProfile(id));
  }

  return { ok: true, profile: profiles.get(id) };
});

fastify.put("/profiles/:id", async (req, reply) => {
  const { id } = req.params;
  if (!id) {
    reply.code(400);
    return { ok: false, error: "missing_id" };
  }

  const body = req.body || {};
  const current = profiles.get(id) || defaultProfile(id);
  const updated = {
    ...current,
    displayName: body.displayName ?? current.displayName,
    avatarUrl: body.avatarUrl ?? current.avatarUrl,
    bio: body.bio ?? current.bio,
    updatedAt: new Date().toISOString(),
  };

  profiles.set(id, updated);
  return { ok: true, profile: updated };
});

fastify.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
