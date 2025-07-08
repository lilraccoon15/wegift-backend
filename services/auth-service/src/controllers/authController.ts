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
} from "../services/authService";
import User from "../models/User";
import sendSuccess from "../utils/sendSuccess";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../errors/CustomErrors";
import currentConfig from "../config";
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

export const registerUser = asyncHandler(async (req, res, next) => {
  const data = registerSchema.parse(req.body);
  const user = await createUser(data);
  sendSuccess(res, "Utilisateur créé avec succès", { userId: user.id }, 201);
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = loginSchema.parse(req.body);

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

  res.cookie("token", result.token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600000,
  });

  sendSuccess(res, "Connexion réussie", {}, 200);
});

export const logoutUser = async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendSuccess(res, "Déconnexion réussie", {}, 200);
};

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
    const { code } = validate2FASchema.parse(req.body);

    const token = await validate2FACode(req.user.id, code);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000,
    });

    sendSuccess(res, "2FA vérifiée avec succès", { token }, 200);
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

    await changeUserEmail(req.user.id, currentPassword, newEmail);

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

    // TODO : vérifier si y a d'autres infos liées au compte

    await fetch(
      `${currentConfig.apiUrls.USER_SERVICE}/api/user/delete-profile`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
        },
        body: JSON.stringify({ userId }),
      }
    );

    sendSuccess(res, "Compte supprimé avec succès", {}, 200);
  }
);
