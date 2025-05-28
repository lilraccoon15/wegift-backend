import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives. Réessayez dans quelques minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
