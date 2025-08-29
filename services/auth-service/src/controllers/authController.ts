import { Request, Response } from "express";
import {
  createUser,
  authenticateUser,
  sendPasswordResetEmail,
  resetUserPassword,
  generate2FASecret,
  activate2FA,
  setUserAsActive,
  validate2FACode,
  deactivate2FA,
  fetchUserAccount,
  changeUserEmail,
  changeUserPassword,
  changeNewsletterSubscription,
  removeUser,
  unlinkGoogle,
  createPasswordService,
  deleteUserProfile,
  deleteUserWishlists,
  deleteUserExchanges,
  deleteUserNotifications,
  fetchUserProfileId,
  refreshService,
} from "../services/authService";
import User from "../models/User";
import sendSuccess from "../utils/sendSuccess";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../errors/CustomErrors";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  activationTokenSchema,
  changeEmailSchema,
  changePasswordSchema,
  emailObjectSchema,
  loginSchema,
  newsletterSchema,
  registerSchema,
  removeUserSchema,
  resetPasswordSchema,
  validate2FASchema,
} from "../schemas/authSchema";
import { Session } from "../models/Session";
import { createSessionAndSetCookies } from "../utils/session";
import { clearAuthCookies, setAccessCookie } from "../utils/cookies";

export const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const sid = req.cookies?.sid;

  if (!refreshToken || !sid) {
    throw new AuthError("Token de rafraîchissement manquant");
  }

  const { accessToken } = await refreshService(sid, refreshToken);

  setAccessCookie(res, accessToken, 1000 * 60 * 30);

  sendSuccess(res, "Token rafraîchi avec succès");
});

export const handleGoogleCallback = asyncHandler(async (req, res, next) => {
  const user = req.user as User;
  if (!user) {
    return next(new AuthError("Authentification échouée"));
  }

  const remember = true;

  const userProfileId = await fetchUserProfileId(String(user.id));

  await createSessionAndSetCookies(
    res,
    String(user.id),
    userProfileId || "",
    remember
  );

  const redirectUrl = `${process.env.FRONTEND_URL}/oauth/success`;

  return res.redirect(redirectUrl);
});

export const registerUser = asyncHandler(async (req, res, next) => {
  const data = registerSchema.parse(req.body);
  const user = await createUser(data);
  sendSuccess(res, "Utilisateur créé avec succès", { userId: user.id }, 201);
});

export const checkEmailAvailability = asyncHandler(async (req, res, next) => {
  const { email } = emailObjectSchema.parse(req.query);

  const existingUser = await User.findOne({ where: { email } });

  sendSuccess(res, "Disponibilité de l'email vérifiée", {
    available: !existingUser,
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password, remember = false } = loginSchema.parse(req.body);

  const result = await authenticateUser(email, password);

  if ("error" in result) return next(new AuthError(result.error));

  if ("requires2FA" in result)
    return sendSuccess(
      res,
      "Double authentification requise",
      {
        requires2FA: true,
        tempToken: result.tempToken,
      },
      200
    );

  await createSessionAndSetCookies(
    res,
    result.id!, // ID auth-service
    result.userId!, // ID user-service (profil)
    remember
  );
  sendSuccess(res, "Connexion réussie", {}, 200);
});

export const logoutUser = asyncHandler(async (req, res) => {
  const sid = req.cookies.sid;
  if (sid) {
    await Session.update({ revokedAt: new Date() }, { where: { id: sid } });
  }

  clearAuthCookies(res);
  sendSuccess(res, "Déconnexion réussie", {}, 200);
});

export const activateUserAccount = asyncHandler(async (req, res, next) => {
  const { token } = activationTokenSchema.parse(req.query);

  const result = await setUserAsActive(token as string);

  if (result === "AlreadyActive")
    return sendSuccess(res, "Compte déjà activé", {}, 200);

  sendSuccess(res, "Compte activé avec succès !", {}, 200);
});

export const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email } = emailObjectSchema.parse(req.body);

  const user = await User.findOne({ where: { email } });

  if (user) await sendPasswordResetEmail(user);

  sendSuccess(res, "Si cet email existe, un lien a été envoyé.", {}, 200);
});

export const confirmPasswordReset = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = resetPasswordSchema.parse(req.body);

  await resetUserPassword(token, newPassword);
  sendSuccess(res, "Mot de passe réinitialisé avec succès.", {}, 200);
});

export const get2FASetup = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { qrCodeDataURL, otpauthUrl, secret } = await generate2FASecret(
      userId
    );
    sendSuccess(
      res,
      "2FA configurée avec succès",
      { qrCodeDataURL, otpauthUrl, secret },
      200
    );
  }
);

export const enable2FAForUser = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { code } = validate2FASchema.parse(req.body);

    const isValid = await activate2FA(userId, code);

    if (!isValid) return next(new ValidationError("Code 2FA invalide"));

    sendSuccess(res, "2FA activée avec succès", {}, 200);
  }
);

export const verify2FACode = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { code } = validate2FASchema.parse(req.body);

    const isValid = await validate2FACode(userId, code);
    if (!isValid) {
      return next(new AuthError("Code 2FA invalide"));
    }

    const remember = req.body.remember ?? false;

    await createSessionAndSetCookies(res, userId, req.user.userId, remember);

    sendSuccess(res, "2FA vérifiée avec succès", {}, 200);
  }
);

export const get2FAStatus = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

    sendSuccess(
      res,
      "Statut 2FA récupéré",
      {
        is2FAEnabled: user.twoFactorEnabled === true,
      },
      200
    );
  }
);

export const disable2FAForUser = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    await deactivate2FA(userId);

    sendSuccess(res, "2FA désactivée avec succès", {}, 200);
  }
);

export const getUserAccount = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const user = await fetchUserAccount(userId);

    sendSuccess(res, "Utilisateur trouvé", { account: user }, 200);
  }
);

export const updateUserEmail = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { currentPassword, newEmail } = changeEmailSchema.parse(req.body);

    await changeUserEmail(userId, currentPassword, newEmail);

    sendSuccess(
      res,
      "Email mis à jour avec succès. Veuillez réactiver votre compte.",
      {},
      200
    );
  }
);

export const updateUserPassword = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body
    );

    await changeUserPassword(userId, currentPassword, newPassword);

    sendSuccess(res, "Mot de passe mis à jour avec succès.", {}, 200);
  }
);

export const updateNewsletterPreference = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { newsletter } = newsletterSchema.parse(req.body);

    await changeNewsletterSubscription(userId, newsletter);

    sendSuccess(
      res,
      "Préfence en newsletter mise à jour avec succès.",
      {},
      200
    );
  }
);

export const deleteUserAccount = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { password } = removeUserSchema.parse(req.body);

    await removeUser(userId, password);

    await deleteUserProfile(userId);
    await deleteUserWishlists(userId);
    await deleteUserExchanges(userId);
    await deleteUserNotifications(userId);

    sendSuccess(res, "Compte supprimé avec succès", {}, 200);
  }
);

export const unlinkGoogleAccount = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    await unlinkGoogle(user);
    sendSuccess(res, "Compte Google dissocié avec succès.", {}, 200);
  }
);

export const createPasswordForUser = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { password } = req.body;

    await createPasswordService(userId, password);

    sendSuccess(res, "Mot de passe enregistré avec succès");
  }
);
