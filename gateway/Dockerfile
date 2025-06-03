FROM node:20-alpine AS build

WORKDIR /index

COPY package*.json ./

RUN npm config set progress=false
RUN npm config set cache /tmp/npm-cache --global

RUN npm install --production

COPY . .

FROM node:20-alpine

WORKDIR /index

COPY --from=build /index/node_modules ./node_modules

COPY --from=build /index ./

EXPOSE 4000

CMD ["node", "dist/index.js"]
