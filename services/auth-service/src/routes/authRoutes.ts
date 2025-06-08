import { Router } from "express";
import {
  register,
  login,
  logout,
  resetPassword,
  confirmPasswordReset,
  setup2FA,
  enable2FA,
  verifyTwoFactorCodeHandler,
  status2FA,
  disable2FA,
  getAccount,
  updateEmail,
  updatePassword,
  activate,
} from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimit";
import {
  emailObjectSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchema";
import { validateBody } from "../middlewares/validateBody";
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware';
import { ensureAuthenticated } from "src/middlewares/ensureAuthenticated";

const router = Router();

router.post("/register", authLimiter, validateBody(registerSchema), register);

router.post("/login", authLimiter, validateBody(loginSchema), login);

router.post("/logout", logout);

router.get("/activate", activate);

router.post("/forgot-password", validateBody(emailObjectSchema), resetPassword);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  confirmPasswordReset
);

router.get("/generate-2fa", verifyTokenMiddleware, ensureAuthenticated, setup2FA);

router.post("/enable-2fa", verifyTokenMiddleware, ensureAuthenticated, enable2FA);

router.post("/verify-2fa", verifyTokenMiddleware, ensureAuthenticated, verifyTwoFactorCodeHandler);

router.get("/2fa-status", verifyTokenMiddleware, ensureAuthenticated, status2FA);

router.post("/disable-2fa", verifyTokenMiddleware, ensureAuthenticated, disable2FA);

router.get("/get-account", verifyTokenMiddleware, ensureAuthenticated, getAccount);

router.put("/update-email", verifyTokenMiddleware, ensureAuthenticated, updateEmail);

router.put("/update-password", verifyTokenMiddleware, ensureAuthenticated, updatePassword);

export default router;
