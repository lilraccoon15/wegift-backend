type EnvType = "development" | "docker" | "test-local" | "test-docker";

const ENV = (process.env.NODE_ENV as EnvType) || "development";

const API_URLS = {
  development: {
    AUTH_SERVICE: "http://localhost:3001",
    EXCHANGE_SERVICE: "http://localhost:3002",
    USER_SERVICE: "http://localhost:3003",
    WISHLIST_SERVICE: "http://localhost:3004",
    NOTIFICATION_SERVICE: "http://localhost:3005",
  },
  docker: {
    AUTH_SERVICE: "http://auth-service:3001",
    EXCHANGE_SERVICE: "http://exchange-service:3002",
    USER_SERVICE: "http://user-service:3003",
    WISHLIST_SERVICE: "http://wishlist-service:3004",
    NOTIFICATION_SERVICE: "http://wishlist-service:3005",
  },
  "test-local": {
    AUTH_SERVICE: "http://localhost:3001",
    EXCHANGE_SERVICE: "http://localhost:3002",
    USER_SERVICE: "http://localhost:3003",
    WISHLIST_SERVICE: "http://localhost:3004",
    NOTIFICATION_SERVICE: "http://localhost:3005",
  },
  "test-docker": {
    AUTH_SERVICE: "http://auth-service:3001",
    EXCHANGE_SERVICE: "http://exchange-service:3002",
    USER_SERVICE: "http://user-service:3003",
    WISHLIST_SERVICE: "http://wishlist-service:3004",
    NOTIFICATION_SERVICE: "http://wishlist-service:3005",
  },
  production: {
    AUTH_SERVICE: "https://auth-service-production-xxx.up.railway.app",
    EXCHANGE_SERVICE: "https://exchange-service-production-xxx.up.railway.app",
    USER_SERVICE: "https://user-service-production-xxx.up.railway.app",
    WISHLIST_SERVICE: "https://wishlist-service-production-xxx.up.railway.app",
    NOTIFICATION_SERVICE:
      "https://notification-service-production-xxx.up.railway.app",
  },
};

const currentConfig = API_URLS[ENV] || API_URLS.development;

export default currentConfig;
