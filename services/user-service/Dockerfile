FROM node:20-alpine AS build

WORKDIR /app

# Copier d'abord package.json + package-lock.json pour profiter du cache Docker
COPY services/user-service/package.json ./
COPY shared ./shared

# Copier tout le code source ensuite
COPY services/user-service ./

RUN npm config set progress=false
RUN npm config set cache /tmp/npm-cache --global
RUN npm cache clean --force
RUN npm install --omit=dev


FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

EXPOSE 3003

CMD ["node", "dist/server.js"]
