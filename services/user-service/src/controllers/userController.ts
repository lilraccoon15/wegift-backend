import sendSuccess from "../utils/sendSuccess";
import {
  createProfileService,
  deleteProfileUser,
  getProfileService,
  updateProfileService,
} from "../services/userService";
import { AuthenticatedRequest } from "../middlewares/verifyTokenMiddleware";

import UserProfile from "../models/UserProfile";
import path from "path";
import fs from "fs";
import { AppError, NotFoundError } from "../errors/CustomErrors";
import { asyncHandler } from "../middlewares/asyncHandler";

export const me = asyncHandler(async (req: AuthenticatedRequest, res, next) => {
  const userId = req.user?.id;

  const profile = await getProfileService(userId);

  if (!profile) return next(new NotFoundError("Profil non trouvé"));

  return sendSuccess(res, "Profil récupéré", profile);
});

export const createProfile = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.id;

    const { firstName, lastName, birthDate } = req.body;

    const profile = await createProfileService(
      userId,
      firstName,
      lastName,
      birthDate
    );

    return sendSuccess(res, "Profil créé", profile);
  }
);

export const getCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.id;

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
  }
);

export const updateProfile = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.id;

    const { firstName, lastName, birthDate, description } = req.body;

    const file = req.file;

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
  }
);

export const deleteProfile = asyncHandler(
  async (req: AuthenticatedRequest, res, next) => {
    const { userId } = req.body;

    if (!userId)
      return next(new AppError("userId manquant dans la requête", 400));

    await deleteProfileUser(userId);
    return sendSuccess(res, "Profil utilisateur supprimé", {}, 200);
  }
);
