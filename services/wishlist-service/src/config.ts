const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`La variable d'environnement ${name} doit être définie !`);
  }
  return value;
};

const config = {
  env: process.env.NODE_ENV || "development",

  jwtSecret: required("JWT_SECRET"),
  jwtAudience: process.env.JWT_AUDIENCE || "wegift-users",
  jwtIssuer: process.env.JWT_ISSUER || "wegift-auth-service",
  tokenExpirationMs: 60 * 60 * 1000, // 1h

  internalApiToken: required("INTERNAL_API_TOKEN"),

  googleApiKey: required("GOOGLE_API_KEY"),
  googleCseId: required("GOOGLE_CSE_ID"),

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  apiUrls: {
    AUTH_SERVICE: required("AUTH_SERVICE"),
    USER_SERVICE: required("USER_SERVICE"),
    WISHLIST_SERVICE: required("WISHLIST_SERVICE"),
    EXCHANGE_SERVICE: required("EXCHANGE_SERVICE"),
    NOTIFICATION_SERVICE: required("NOTIFICATION_SERVICE"),
  },
};

export default config;
