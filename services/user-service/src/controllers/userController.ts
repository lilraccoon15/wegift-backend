import { Response } from "express";
import sendError from "../utils/sendError";
import sendSuccess from "../utils/sendSuccess";
import {
    createProfileService,
    updateProfileService,
} from "../services/userService";
import { AuthenticatedRequest } from "../../../../shared/middlewares/verifyTokenMiddleware";
import UserProfile from "../models/UserProfile";
import path from "path";
import fs from "fs";

export const createProfile = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Non authentifié", 401);

    const { firstName, lastName, birthDate } = req.body;

    try {
        const profile = await createProfileService(
            userId,
            firstName,
            lastName,
            birthDate
        );

        return sendSuccess(res, "Profil créé", profile);
    } catch (error: any) {
        if (error.message === "Profil déjà existant") {
            return sendError(res, error.message, 409);
        }
        return sendError(res, "Erreur serveur", 500);
    }
};

export const getCurrentUser = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Non authentifié", 401);

    if (!userId) return sendError(res, "Non autorisé", 401);

    try {
        const user = await UserProfile.findOne({
            where: { userId },
            attributes: [
                "id",
                "firstName",
                "lastName",
                "birthDate",
                "picture",
                "description",
            ],
        });

        if (!user) return sendError(res, "Utilisateur non trouvé", 404);

        sendSuccess(res, "Utilisateur trouvé", { user }, 200);
    } catch (error) {
        return sendError(res, "Erreur serveur", 500);
    }
};

export const updateProfile = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const userId = req.user?.id;
    if (!userId) return sendError(res, "Non authentifié", 401);

    const { firstName, lastName, birthDate, description } = req.body;

    try {
        const file = req.file;
        console.log(file);
        if (file) {
            const uploadDir = path.join(
                __dirname,
                "../../public/uploads/profilePictures/"
            );
            const files = fs.readdirSync(uploadDir);

            files.forEach((fileInDir) => {
                if (
                    fileInDir.startsWith(`profile_${userId}_pp`) &&
                    fileInDir !== file.filename
                ) {
                    fs.unlinkSync(path.join(uploadDir, fileInDir));
                }
            });
        }

        const picture = req.file
            ? `/uploads/profilePictures/${req.file.filename}`
            : undefined;

        const updatedProfile = await updateProfileService(
            userId,
            firstName,
            lastName,
            birthDate,
            picture,
            description
        );

        return sendSuccess(res, "Profil mis à jour", updatedProfile);
    } catch (error: any) {
        if (error.message === "Profil non trouvé") {
            return sendError(res, error.message, 404);
        }
        return sendError(res, "Erreur serveur", 500);
    }
};
