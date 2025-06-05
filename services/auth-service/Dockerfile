FROM node:20-alpine AS build

WORKDIR /app

COPY services/auth-service/package.json ./
COPY shared ./shared

COPY services/auth-service ./

RUN npm config set progress=false
RUN npm config set cache /tmp/npm-cache --global
RUN npm cache clean --force
RUN npm install --omit=dev


FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

EXPOSE 3001

CMD ["node", "dist/server.js"]
