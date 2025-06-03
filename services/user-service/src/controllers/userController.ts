import { Request, Response } from "express";
import logger from '../utils/logger';
import sendError from "../utils/sendError";
import sendSuccess from "../utils/sendSuccess";
import { createProfileService, getProfileService } from "../services/userService";
import { AuthenticatedRequest } from "../middlewares/userMiddleware";
import UserProfile from "../models/UserProfile";

export const me = async (req: AuthenticatedRequest, res: Response) => {
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

export const createProfile = async (req: AuthenticatedRequest, res: Response) => {
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

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => { 
  const userId = req.user?.id;

  if (!userId) return sendError(res, "Non autorisé", 401);

  try {
    const user = await UserProfile.findOne({where: { userId }, attributes : ["id", "firstName", "lastName"]});

    if(!user) return sendError(res, "Utilisateur non trouvé", 404);

    sendSuccess(res, "Utilisateur trouvé", { user }, 200);
  } catch(error) {
    return sendError(res, "Erreur serveur", 500);
  }
};