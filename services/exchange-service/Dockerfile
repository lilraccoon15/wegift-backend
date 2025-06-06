FROM node:20-alpine AS build

WORKDIR /app

# Installer npm 8 (optionnel)
RUN npm install -g npm@8.19.3

# Copier package.json + package-lock.json en priorité (prend en compte si tu as un package-lock.json)
COPY services/exchange-service/package*.json ./

# Copier le dossier shared si besoin
COPY shared ./shared

# Installer les dépendances (prod seulement)
RUN npm config set progress=false \
 && npm config set cache /tmp/npm-cache --global \
 && npm cache clean --force \
 && npm install --omit=dev

# Copier le code source du service
COPY services/exchange-service ./

# Construire le service si besoin (exemple)
# RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Installer npm 8 (optionnel)
RUN npm install -g npm@8.19.3

# Copier node_modules du build
COPY --from=build /app/node_modules ./node_modules

# Copier le reste des fichiers du build
COPY --from=build /app ./

EXPOSE 3002  

CMD ["node", "dist/server.js"]
