# Stage 1: dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run generate-keys
RUN npm run build
RUN mkdir -p /app/keys \
  && if ls /app/jwt-*.pem >/dev/null 2>&1; then cp /app/jwt-*.pem /app/keys/; fi

# Stage 3: run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/keys/ ./
RUN mkdir -p /app/data && chown app:app /app/data

USER app
EXPOSE 8081
CMD ["node", "dist/index.js"]
