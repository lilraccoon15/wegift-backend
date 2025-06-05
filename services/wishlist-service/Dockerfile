FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers package.json et package-lock.json avant tout
COPY services/wishlist-service/package.json ./
COPY shared ./shared

# Copier le code source après l'installation des dépendances
COPY services/wishlist-service ./

RUN npm config set progress=false
RUN npm config set cache /tmp/npm-cache --global
RUN npm cache clean --force
RUN npm install --omit=dev


FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

EXPOSE 3004

CMD ["node", "dist/server.js"]
