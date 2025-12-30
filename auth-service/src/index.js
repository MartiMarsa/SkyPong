const fastify = require("fastify")({ logger: true });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db, init } = require("./db");

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "dev_insecure_secret";

init();

// Prometheus metrics
fastify.register(require("fastify-metrics"), { endpoint: "/metrics" });

// Health
fastify.get("/healthz", async () => ({ ok: true, service: "auth-service" }));

// Helpers
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Register (mock real)
fastify.post("/register", async (req, reply) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) return reply.code(400).send({ error: "email/password required" });
  if (String(password).length < 8) return reply.code(400).send({ error: "password too short (>=8)" });

  const existing = await dbGet("SELECT id FROM users WHERE email = ?", [email]).catch(() => null);
  if (existing) return reply.code(409).send({ error: "email already exists" });

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();

  const result = await dbRun(
    "INSERT INTO users(email, password_hash, display_name, created_at) VALUES(?,?,?,?)",
    [email, passwordHash, displayName || null, now]
  );

  return reply.code(201).send({ id: result.lastID, email, displayName: displayName || null });
});

// Login -> JWT
fastify.post("/login", async (req, reply) => {
  const { email, password } = req.body || {};
  if (!email || !password) return reply.code(400).send({ error: "email/password required" });

  const user = await dbGet("SELECT id, email, password_hash, display_name FROM users WHERE email = ?", [email]).catch(() => null);
  if (!user) return reply.code(401).send({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return reply.code(401).send({ error: "invalid credentials" });

  const token = jwt.sign(
    { sub: user.id, email: user.email, displayName: user.display_name || null },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  return { token, user: { id: user.id, email: user.email, displayName: user.display_name || null } };
});

// Verify token (para que el frontend pruebe rápido)
fastify.get("/me", async (req, reply) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return reply.code(401).send({ error: "missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { user: payload };
  } catch {
    return reply.code(401).send({ error: "invalid token" });
  }
});

fastify.listen({ port: PORT, host: "0.0.0.0" }).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
