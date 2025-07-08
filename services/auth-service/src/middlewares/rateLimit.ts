import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: "Trop de tentatives. Réessayez dans quelques minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives de connexion. Réessayez plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: "Trop de demandes de réinitialisation. Réessayez plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});
