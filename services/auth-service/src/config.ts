type EnvType = "development" | "docker" | "test-local" | "test-docker";

const ENV = (process.env.NODE_ENV as EnvType) || "development";

const API_URLS = {
  development: {
    AUTH_SERVICE: "http://localhost:3001",
    EXCHANGE_SERVICE: "http://localhost:3002",
    USER_SERVICE: "http://localhost:3003",
    WISHLIST_SERVICE: "http://localhost:3004",
  },
  docker: {
    AUTH_SERVICE: "http://auth-service:3001",
    EXCHANGE_SERVICE: "http://exchange-service:3002",
    USER_SERVICE: "http://user-service:3003",
    WISHLIST_SERVICE: "http://wishlist-service:3004",
  },
  "test-local": {
    AUTH_SERVICE: "http://localhost:3001",
    EXCHANGE_SERVICE: "http://localhost:3002",
    USER_SERVICE: "http://localhost:3003",
    WISHLIST_SERVICE: "http://localhost:3004",
  },
  "test-docker": {
    AUTH_SERVICE: "http://auth-service:3001",
    EXCHANGE_SERVICE: "http://exchange-service:3002",
    USER_SERVICE: "http://user-service:3003",
    WISHLIST_SERVICE: "http://wishlist-service:3004",
  },
};

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("La variable d'environnement JWT_SECRET doit être définie !");
}

const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "your-app";
const JWT_ISSUER = process.env.JWT_ISSUER || "your-api";
const TOKEN_EXPIRATION_MS = 60 * 60 * 1000; 

const currentConfig = {
  apiUrls: API_URLS[ENV] || API_URLS.development,
  jwtSecret: JWT_SECRET,
  jwtAudience: JWT_AUDIENCE,
  jwtIssuer: JWT_ISSUER,
  tokenExpirationMs: TOKEN_EXPIRATION_MS,
  env: ENV,
};

export default currentConfig;
