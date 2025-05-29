import { Router } from "express";
import {
  register,
  login,
  logout,
  activateUser,
  resetPassword,
  confirmPasswordReset,
} from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimit";
import {
  emailObjectSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchema";
import { validateBody } from "../middlewares/validateBody";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), register);

router.post("/login", authLimiter, validateBody(loginSchema), login);

router.post("/logout", logout);

router.get("/activate", activateUser);

router.post("/forgot-password", validateBody(emailObjectSchema), resetPassword);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  confirmPasswordReset
);

export default router;
