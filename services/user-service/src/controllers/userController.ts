import { Request, Response } from "express";
import logger from '../utils/logger';
import sendError from "../utils/sendError";
import sendSuccess from "../utils/sendSuccess";
import { createProfileService, getProfileService } from "../services/userService";

export const me = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, "Non authentifié", 401);
  }

  try {
    const profile = await getProfileService(userId);

    if (!profile) {
      return sendError(res, "Profil non trouvé", 404);
    }

    return sendSuccess(res, "Profil récupéré", profile);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500);
  }
};

export const createProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, "Non authentifié", 401);
  }

  const { firstName, lastName, birthDate } = req.body;

  try {
    const profile = await createProfileService(userId, firstName, lastName, birthDate);

    return sendSuccess(res, "Profil créé", profile);
  } catch (error: any) {
    if (error.message === "Profil déjà existant") {
      return sendError(res, error.message, 409);
    }
    return sendError(res, "Erreur serveur", 500);
  }
};
