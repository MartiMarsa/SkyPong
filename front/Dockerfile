FROM node:20-alpine

WORKDIR /app

# Copiamos solo dependencias primero para cache
COPY package.json package-lock.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Puerto típico de Colyseus
EXPOSE 3000

CMD ["npm", "run", "dev"]
