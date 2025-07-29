FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_BACKEND_URL_AUTH
ARG VITE_API_URL
ARG VITE_BACKEND_URL_WISHLIST
ARG VITE_BACKEND_URL_USER
ARG VITE_BACKEND_URL_EXCHANGE

ENV VITE_BACKEND_URL_AUTH=$VITE_BACKEND_URL_AUTH
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL_WISHLIST=$VITE_BACKEND_URL_WISHLIST
ENV VITE_BACKEND_URL_USER=$VITE_BACKEND_URL_USER
ENV VITE_BACKEND_URL_EXCHANGE=$VITE_BACKEND_URL_EXCHANGE

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run prebuild || true

RUN npm run build

FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3003

CMD ["sh", "./start.sh"]
