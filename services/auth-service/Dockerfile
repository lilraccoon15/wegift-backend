# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Build args injectés automatiquement par Railway
ARG VITE_BACKEND_URL_AUTH
ARG VITE_API_URL
ARG VITE_BACKEND_URL_WISHLIST
ARG VITE_BACKEND_URL_USER
ARG VITE_BACKEND_URL_EXCHANGE

# Injection dans l'environnement pour node (prébuild)
ENV VITE_BACKEND_URL_AUTH=$VITE_BACKEND_URL_AUTH
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL_WISHLIST=$VITE_BACKEND_URL_WISHLIST
ENV VITE_BACKEND_URL_USER=$VITE_BACKEND_URL_USER
ENV VITE_BACKEND_URL_EXCHANGE=$VITE_BACKEND_URL_EXCHANGE

# Dépendances
COPY package*.json ./
RUN npm install

# Code source
COPY . .

# Génération de clientEnv.ts (pour frontend seulement, ignoré ici si pas utile)
RUN npm run prebuild || true

# Build du projet
RUN npm run build

# Étape finale
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

# Re-install sans les devDependencies
COPY package*.json ./
RUN npm install --omit=dev

# ✅ Copie les fichiers nécessaires à l’exécution
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Port d’écoute
EXPOSE 3001

# Pour debug : vérifier que l’image est bien là
RUN ls -R ./public

# Lancement de l’app
CMD ["node", "dist/server.js"]
