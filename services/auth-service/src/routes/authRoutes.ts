import { Router } from "express";
import passport from "passport";

import {
    authLimiter,
    loginLimiter,
    passwordResetLimiter,
} from "../middlewares/rateLimit";
import { validateBody } from "../middlewares/validateBody";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

import {
    createPasswordSchema,
    emailObjectSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "../schemas/authSchema";

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
    checkEmailAvailability,
    handleGoogleCallback,
    unlinkGoogleAccount,
    createPasswordForUser,
} from "../controllers/authController";

import User from "../models/User";
import sendSuccess from "../utils/sendSuccess";
import { NotFoundError, ValidationError } from "../errors/CustomErrors";

const router = Router();
const requireAuth = [verifyTokenMiddleware, ensureAuthenticated];

// === Auth ===
router.post(
    "/register",
    authLimiter,
    validateBody(registerSchema),
    registerUser
);
router.post("/login", loginLimiter, validateBody(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.get("/check-email", checkEmailAvailability);
router.get("/activate", activateUserAccount);

// === Mot de passe oublié ===
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

// === 2FA ===
router.get("/generate-2fa", ...requireAuth, get2FASetup);
router.post("/enable-2fa", ...requireAuth, enable2FAForUser);
router.post("/verify-2fa", ...requireAuth, verify2FACode);
router.get("/2fa-status", ...requireAuth, get2FAStatus);
router.post("/disable-2fa", ...requireAuth, disable2FAForUser);

// === Compte utilisateur ===
router.get("/get-account", ...requireAuth, getUserAccount);
router.put("/update-email", ...requireAuth, updateUserEmail);
router.put("/update-password", ...requireAuth, updateUserPassword);
router.patch("/update-newsletter", ...requireAuth, updateNewsletterPreference);
router.delete("/delete-account", ...requireAuth, deleteUserAccount);

// === Google OAuth ===
router.post(
    "/create-password",
    ...requireAuth,
    validateBody(createPasswordSchema),
    createPasswordForUser
);
router.get(
    "/oauth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
    "/oauth/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`,
    }),
    handleGoogleCallback
);
router.delete("/unlink-google", ...requireAuth, unlinkGoogleAccount);

// === Tests ===
if (["test", "test-local"].includes(process.env.NODE_ENV || "")) {
    router.post("/fake-activate", async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) throw new ValidationError("Email requis");

            const user = await User.findOne({ where: { email } });
            if (!user) throw new NotFoundError("Utilisateur non trouvé");

            user.isActive = true;
            await user.save();

            return sendSuccess(res, "Utilisateur activé (test)");
        } catch (err) {
            next(err);
        }
    });
}

export default router;
