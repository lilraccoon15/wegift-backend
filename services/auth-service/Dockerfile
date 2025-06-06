FROM node:20-alpine AS build

WORKDIR /app

# Installer npm 8 globalement (optionnel, à faire avant les installs)
RUN npm install -g npm@8.19.3

# Copier uniquement package.json et package-lock.json d'abord pour bénéficier du cache Docker
COPY services/auth-service/package*.json ./

# Copier le dossier shared (si nécessaire pour build)
COPY shared ./shared

# Installer les dépendances avant de copier tout le code
RUN npm config set progress=false \
 && npm config set cache /tmp/npm-cache --global \
 && npm cache clean --force \
 && npm install --omit=dev

# Copier le reste du code après l'installation des dépendances (pour profiter du cache si les dépendances ne changent pas)
COPY services/auth-service ./

# Construire si besoin (ajoute ici la commande build si tu as un build step)
# RUN npm run build (exemple)

FROM node:20-alpine

WORKDIR /app

# Installer npm 8 (optionnel)
RUN npm install -g npm@8.19.3

# Copier les node_modules du build stage
COPY --from=build /app/node_modules ./node_modules

# Copier le reste des fichiers
COPY --from=build /app ./

EXPOSE 3001

CMD ["node", "dist/server.js"]
