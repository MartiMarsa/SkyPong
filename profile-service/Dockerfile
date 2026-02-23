# STAGE 1: Build (Necesitamos TODO para compilar)
FROM node:20-alpine AS builder
WORKDIR /app

# Herramientas para módulos nativos (SQLite, etc.)
RUN apk add --no-cache python3 make g++ libc-dev

COPY package.json package-lock.json ./
# Instalamos TODO (incluyendo devDependencies como typescript)
RUN npm install 

COPY src ./src
COPY tsconfig.json ./tsconfig.json
# Compilamos aquí
RUN npx tsc

# STAGE 2: Runner (Cambiamos Alpine por Slim)
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Herramientas de compilación en Debian (mucho más estables)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r app && useradd -r -g app app

COPY package.json package-lock.json ./

# Instalamos dependencias (npm ci compilará SQLite sin problemas aquí)
RUN npm ci --omit=dev

# Copiamos el build del stage anterior
COPY --from=builder /app/dist ./dist

# Directorio de uploads
RUN mkdir -p /app/uploads/avatars && chown -R app:app /app

# Copiamos el avatar por defecto y lo cambiamos de propietario
COPY --chown=app:app uploads/avatars/default-avatar.webp /app/uploads/avatars/
USER app
EXPOSE 5000
CMD ["node", "dist/index.js"]
