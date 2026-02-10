# Stage 1: dependencies
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev


# Stage 2: build + run
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app


# Copy deps
COPY --from=deps /app/node_modules ./node_modules

# Copy sources
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY profile.db ./profile.db

# Build
RUN npm install -g typescript && tsc


# Create uploads dir
RUN mkdir -p /app/uploads/avatars && chown -R app:app /app


USER app

EXPOSE 8082

CMD ["node", "dist/index.js"]

