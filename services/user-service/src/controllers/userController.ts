import { NextFunction, Request, Response } from "express";
import sendSuccess from "../utils/sendSuccess";
import {
    createProfileService,
    getProfileService,
    updateProfileService,
} from "../services/userService";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";

import UserProfile from "../models/UserProfile";
import path from "path";
import fs from "fs";
import {
    AppError,
    ConflictError,
    NotFoundError,
} from "../errors/CustomErrors";

export const me = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;

    try {
        const profile = await getProfileService(userId);

        if (!profile) return next(new NotFoundError("Profil non trouvé"));

        return sendSuccess(res, "Profil récupéré", profile);
    } catch (error) {
        next(error);
    }
};

export const createProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;

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
        if (error.message === "Profil déjà existant")
            return next(new ConflictError(error.message));

        next(error);
    }
};

export const getCurrentUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;

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

        if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

        sendSuccess(res, "Utilisateur trouvé", { user }, 200);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.id;

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
        if (error.message === "Profil non trouvé")
            return next(new NotFoundError(error.message));
        next(error);
    }
};
