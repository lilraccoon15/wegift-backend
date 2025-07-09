import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  confirmPasswordReset,
  get2FASetup,
  enable2FAForUser,
  verify2FACode,
  get2FAStatus,
  disable2FAForUser,
  getUserAccount,
  updateUserEmail,
  updateUserPassword,
  activateUserAccount,
  updateNewsletterPreference,
  deleteUserAccount,
} from "../controllers/authController";
import {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
} from "../middlewares/rateLimit";
import {
  emailObjectSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchema";
import { validateBody } from "../middlewares/validateBody";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import User from "../models/User";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  registerUser
);

router.post("/login", loginLimiter, validateBody(loginSchema), loginUser);

router.post("/logout", logoutUser);

router.get("/activate", activateUserAccount);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateBody(emailObjectSchema),
  requestPasswordReset
);

router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  confirmPasswordReset
);

router.get(
  "/generate-2fa",
  verifyTokenMiddleware,
  ensureAuthenticated,
  get2FASetup
);

router.post(
  "/enable-2fa",
  verifyTokenMiddleware,
  ensureAuthenticated,
  enable2FAForUser
);

router.post(
  "/verify-2fa",
  verifyTokenMiddleware,
  ensureAuthenticated,
  verify2FACode
);

router.get(
  "/2fa-status",
  verifyTokenMiddleware,
  ensureAuthenticated,
  get2FAStatus
);

router.post(
  "/disable-2fa",
  verifyTokenMiddleware,
  ensureAuthenticated,
  disable2FAForUser
);

router.get(
  "/get-account",
  verifyTokenMiddleware,
  ensureAuthenticated,
  getUserAccount
);

router.put(
  "/update-email",
  verifyTokenMiddleware,
  ensureAuthenticated,
  updateUserEmail
);

router.put(
  "/update-password",
  verifyTokenMiddleware,
  ensureAuthenticated,
  updateUserPassword
);

router.patch(
  "/update-newsletter",
  verifyTokenMiddleware,
  ensureAuthenticated,
  updateNewsletterPreference
);

router.delete(
  "/delete-account",
  verifyTokenMiddleware,
  ensureAuthenticated,
  deleteUserAccount
);

// Route spéciale pour tests uniquement : activation simplifiée par email
if (["test", "test-local"].includes(process.env.NODE_ENV || "")) {
  router.post("/fake-activate", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email requis" });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: "Utilisateur activé (test)" });
  });
}

export default router;
