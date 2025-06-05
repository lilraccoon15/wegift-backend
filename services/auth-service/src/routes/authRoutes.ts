import { Router } from "express";
import {
  register,
  login,
  logout,
  activateUser,
  resetPassword,
  confirmPasswordReset,
  setup2FA,
  enable2FA,
  verifyTwoFactorCodeHandler,
  status2FA,
  disable2FA,
  getAccount,
  updateEmail,
} from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimit";
import {
  emailObjectSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchema";
import { validateBody } from "../middlewares/validateBody";
import { verifyTokenMiddleware } from 'shared';
// import { verifyTokenMiddleware } from "../../../../shared/middlewares/verifyTokenMiddleware";
// import { verifyTokenMiddleware } from "../middlewares/authMiddleware";

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

router.get("/generate-2fa", verifyTokenMiddleware, setup2FA);

router.post("/enable-2fa", verifyTokenMiddleware, enable2FA);

router.post("/verify-2fa", verifyTokenMiddleware, verifyTwoFactorCodeHandler);

router.get("/2fa-status", verifyTokenMiddleware, status2FA);

router.post("/disable-2fa", verifyTokenMiddleware, disable2FA);

router.get("/get-account", verifyTokenMiddleware, getAccount);

router.get("/update-email", verifyTokenMiddleware, updateEmail);

export default router;
