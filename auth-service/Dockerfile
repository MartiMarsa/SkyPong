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

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY jwt-*.pem ./
COPY tsconfig.json ./tsconfig.json

RUN npm install -g typescript && tsc
RUN mkdir -p /app/data && chown app:app /app/data

USER app
EXPOSE 8081
CMD ["node", "src/index.js"]
