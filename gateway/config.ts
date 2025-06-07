const dockerUrls = {
  AUTH_SERVICE: "http://auth-service:3001",
  EXCHANGE_SERVICE: "http://exchange-service:3002",
  USER_SERVICE: "http://user-service:3003",
  WISHLIST_SERVICE: "http://wishlist-service:3004",
};

type EnvType =
  | "development"
  | "docker"
  | "test-local"
  | "test-docker"
  | "eval";

const API_URLS = {
  development: {
    AUTH_SERVICE: "http://localhost:3001",
    EXCHANGE_SERVICE: "http://localhost:3002",
    USER_SERVICE: "http://localhost:3003",
    WISHLIST_SERVICE: "http://localhost:3004",
  },
  docker: dockerUrls,
  "test-local": {
    AUTH_SERVICE: "http://localhost:3001",
    EXCHANGE_SERVICE: "http://localhost:3002",
    USER_SERVICE: "http://localhost:3003",
    WISHLIST_SERVICE: "http://localhost:3004",
  },
  "test-docker": dockerUrls,
  eval: dockerUrls,
};

const ENV = (process.env.NODE_ENV as EnvType) || "development";

const currentConfig = API_URLS[ENV] || API_URLS.development;

export default currentConfig;
