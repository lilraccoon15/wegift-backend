import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const config = {
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  exchangeServiceUrl: process.env.EXCHANGE_SERVICE_URL || "http://localhost:3002",
  usersServiceUrl: process.env.USERS_SERVICE_URL || "http://localhost:3003",
  wishlistServiceUrl: process.env.WISHLIST_SERVICE_URL || "http://localhost:3004",
};
