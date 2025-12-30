FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

# carpeta persistida por volumen sqlite_auth:/app/data
RUN mkdir -p /app/data && chown app:app /app/data

USER app
EXPOSE 3000
CMD ["node", "src/index.js"]
