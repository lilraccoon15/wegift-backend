import { Request, Response } from "express";
import UserProfile from "../models/UserProfile";
import logger from '../utils/logger';

export const me = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Non authentifié" });
    return;
  }

  try {
    const profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) {
      res.status(404).json({ message: "Profil non trouvé" });
      return;
    }

    res.json(profile);
    return;
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
    return;
  }
};

export const createProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Non authentifié" });
    return;
  }

  const { firstName, lastName, birthDate } = req.body;

  if (!userId || !firstName || !lastName || !birthDate) {
    res.status(400).json({ message: "Champs manquants" });
    return;
  }

  try {
    const existingProfile = await UserProfile.findOne({ where: { userId } });
    if (existingProfile) {
      res.status(409).json({ message: "Profil déjà existant" });
      return;
    }

    const profile = await UserProfile.create({
      userId,
      firstName,
      lastName,
      birthDate,
    });

    res.status(201).json({ message: "Profil créé", profile });
    return;
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Erreur serveur" });
    return;
  }
};
