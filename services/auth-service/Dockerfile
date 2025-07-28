FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

# ✅ Copie les fichiers buildés
COPY --from=builder /app/dist ./dist

# ✅ Copie les fichiers statiques nécessaires à Express
COPY --from=builder /app/public ./public

EXPOSE 3001

RUN ls -R ./public

CMD ["node", "dist/server.js"]
