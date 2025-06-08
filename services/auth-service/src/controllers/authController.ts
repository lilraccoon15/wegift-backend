import { NextFunction, Request, Response } from "express";
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
} from "../services/authService";
import User from "../models/User";
import sendSuccess from "../utils/sendSuccess";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";
import {
    AppError,
    AuthError,
    ConflictError,
    NotFoundError,
    ValidationError,
} from "../errors/CustomErrors";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await registerUser(req.body);
        sendSuccess(
            res,
            "Utilisateur créé avec succès",
            { userId: user.id },
            201
        );
    } catch (error: any) {
        if (error.statusCode) return next(error);
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    sendSuccess(res, "Déconnexion réussie", 200);
};

export const activate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.query;

    if (!token) return next(new ValidationError("Token manquant"));

    try {
        const result = await activateUser(token as string);

        if (result === "AlreadyActive")
            return sendSuccess(res, "Compte déjà activé", 200);

        sendSuccess(res, "Compte activé avec succès !", 200);
    } catch (error: any) {
        if (error.message === "TokenExpired")
            return next(new ValidationError("Token expiré"));

        if (error.message === "UserNotFound")
            return next(new NotFoundError("Utilisateur non trouvé"));

        if (error.message === "ProfileCreationFailed")
            return next(
                new AppError(
                    "Activation réussie, mais échec lors de la création du profil.",
                    500
                )
            );

        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user) await sendPasswordResetEmail(user);

        sendSuccess(res, "Si cet email existe, un lien a été envoyé.", 200);
    } catch (error) {
        next(error);
    }
};

export const confirmPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token, newPassword } = req.body;

    try {
        await resetUserPassword(token, newPassword);
        sendSuccess(res, "Mot de passe réinitialisé avec succès.", 200);
    } catch (error: any) {
        next(error);
    }
};

export const setup2FA = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        const { qrCodeDataURL, otpauthUrl, secret } = await setupTwoFactor(
            userId
        );
        sendSuccess(
            res,
            "2FA configurée avec succès",
            { qrCodeDataURL, otpauthUrl, secret },
            200
        );
    } catch (err) {
        next(new AppError("Erreur lors de la configuration 2FA", 500));
    }
};

export const enable2FA = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;

        if (!code) return next(new ValidationError("Code 2FA requis"));

        const isValid = await verifyTwoFactorCode(userId, code);

        if (!isValid) return next(new ValidationError("Code 2FA invalide"));

        sendSuccess(res, "2FA activée avec succès", 200);
    } catch (error) {
        next(new AppError("Erreur lors de l'activation 2FA", 500));
    }
};

export const verifyTwoFactorCodeHandler = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
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
    } catch (err: any) {
        if (err.message === "CodeMissing")
            return next(new ValidationError("Code 2FA manquant"));

        if (err.message === "InvalidCode")
            return next(new AuthError("Code 2FA invalide"));

        next(new AppError("Erreur serveur", 500));
    }
};

export const status2FA = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
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
    } catch (err: any) {
        next(new AppError("Erreur serveur", 500));
    }
};

export const disable2FA = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        await disableTwoFactorAuth(userId);

        sendSuccess(res, "2FA désactivée avec succès", 200);
    } catch (error: any) {
        if (error.message === "Utilisateur non trouvé")
            return next(new NotFoundError(error.message));
        next(new AppError("Erreur serveur", 500));
    }
};

export const getAccount = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        const user = await getAccountById(userId);

        sendSuccess(res, "Utilisateur trouvé", { account: user }, 200);
    } catch (error: any) {
        if (error.message === "Utilisateur non trouvé")
            return next(new NotFoundError(error.message));

        next(new AppError("Erreur serveur", 500));
    }
};

export const updateEmail = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;
        const { password: currentPassword, email: newEmail } = req.body;

        if (!currentPassword || !newEmail)
            return next(
                new ValidationError(
                    "Mot de passe actuel et nouvel email requis"
                )
            );

        await updateEmailForUser(userId, currentPassword, newEmail);

        sendSuccess(
            res,
            "Email mis à jour avec succès. Veuillez réactiver votre compte.",
            200
        );
    } catch (error: any) {
        if (error.message === "Utilisateur non trouvé")
            return next(new NotFoundError(error.message));

        if (error.message === "Mot de passe incorrect")
            return next(new AuthError(error.message));

        if (error.message === "EmailDéjàUtilisé")
            return next(new ConflictError("Cet email est déjà utilisé"));

        next(new AppError("Erreur lors de la mise à jour de l'email", 500));
    }
};

export const updatePassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword)
            return next(
                new ValidationError("Mot de passe actuel et nouveau requis")
            );

        await setNewPassword(userId, currentPassword, newPassword);

        sendSuccess(res, "Mot de passe mis à jour avec succès.", 200);
    } catch (error: any) {
        if (error.message === "Utilisateur non trouvé")
            return next(new NotFoundError(error.message));

        if (error.message === "Mot de passe incorrect")
            return next(new AuthError(error.message));

        next(
            new AppError("Erreur lors de la mise à jour du mot de passe", 500)
        );
    }
};

export const updateNewsletter = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        const { newsletter } = req.body;

        await setNewsletter(userId, newsletter);

        sendSuccess(
            res,
            "Préfence en newsletter mise à jour avec succès.",
            200
        );
    } catch (error: any) {
        if (error.message === "Utilisateur non trouvé")
            return next(new NotFoundError(error.message));
        next(
            new AppError("Erreur lors de la mise à jour de la préférence", 500)
        );
    }
};
