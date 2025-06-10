import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  sendPasswordResetEmail,
  resetUserPassword,
  setupTwoFactor,
  verifyTwoFactorCode,
  activateUser,
  verifyTwoFactorCodeAndGenerateToken,
  disableTwoFactorAuth,
  getAccountById,
  updateEmailForUser,
  setNewPassword,
  setNewsletter,
  deleteUserAccount,
} from "../services/authService";
import User from "../models/User";
import sendSuccess from "../utils/sendSuccess";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import {
  AppError,
  AuthError,
  NotFoundError,
  ValidationError,
} from "../errors/CustomErrors";
import currentConfig from "../config";
import { asyncHandler } from "src/middlewares/asyncHandler";

export const register = asyncHandler(async (req, res, next) => {
  const user = await registerUser(req.body);
  sendSuccess(res, "Utilisateur créé avec succès", { userId: user.id }, 201);
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

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

  sendSuccess(res, "Connexion réussie", 200);
});

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendSuccess(res, "Déconnexion réussie", 200);
};

export const activate = asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  if (!token) return next(new ValidationError("Token manquant"));

  const result = await activateUser(token as string);

  if (result === "AlreadyActive")
    return sendSuccess(res, "Compte déjà activé", 200);

  sendSuccess(res, "Compte activé avec succès !", 200);
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user) await sendPasswordResetEmail(user);

  sendSuccess(res, "Si cet email existe, un lien a été envoyé.", 200);
});

export const confirmPasswordReset = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  await resetUserPassword(token, newPassword);
  sendSuccess(res, "Mot de passe réinitialisé avec succès.", 200);
});

export const setup2FA = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { qrCodeDataURL, otpauthUrl, secret } = await setupTwoFactor(userId);
    sendSuccess(
      res,
      "2FA configurée avec succès",
      { qrCodeDataURL, otpauthUrl, secret },
      200
    );
  }
);

export const enable2FA = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code) return next(new ValidationError("Code 2FA requis"));

    const isValid = await verifyTwoFactorCode(userId, code);

    if (!isValid) return next(new ValidationError("Code 2FA invalide"));

    sendSuccess(res, "2FA activée avec succès", 200);
  }
);

export const verifyTwoFactorCodeHandler = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const token = await verifyTwoFactorCodeAndGenerateToken(
      req.user.id,
      req.body.code
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000,
    });

    sendSuccess(res, "2FA vérifiée avec succès", { token }, 200);
  }
);

export const status2FA = asyncHandler(
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

export const disable2FA = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    await disableTwoFactorAuth(userId);

    sendSuccess(res, "2FA désactivée avec succès", 200);
  }
);

export const getAccount = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const user = await getAccountById(userId);

    sendSuccess(res, "Utilisateur trouvé", { account: user }, 200);
  }
);

export const updateEmail = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;
    const { password: currentPassword, email: newEmail } = req.body;

    if (!currentPassword || !newEmail)
      return next(
        new ValidationError("Mot de passe actuel et nouvel email requis")
      );
    // TODO : vérifier si le mail à changé lol
    await updateEmailForUser(userId, currentPassword, newEmail);

    sendSuccess(
      res,
      "Email mis à jour avec succès. Veuillez réactiver votre compte.",
      200
    );
  }
);

export const updatePassword = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return next(new ValidationError("Mot de passe actuel et nouveau requis"));

    await setNewPassword(userId, currentPassword, newPassword);

    sendSuccess(res, "Mot de passe mis à jour avec succès.", 200);
  }
);

export const updateNewsletter = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { newsletter } = req.body;

    await setNewsletter(userId, newsletter);

    sendSuccess(res, "Préfence en newsletter mise à jour avec succès.", 200);
  }
);

export const deleteAccount = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user.id;

    const { password } = req.body;

    await deleteUserAccount(userId, password);

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

    sendSuccess(res, "Compte supprimé avec succès", 200);
  }
);
