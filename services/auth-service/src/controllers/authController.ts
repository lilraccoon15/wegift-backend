import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { loginSchema, registerSchema } from '../schemas/authSchema';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: parseResult.error.issues[0].message });
    return;
  }

  try {
    const user = await registerUser(parseResult.data);
    res.status(201).json({ message: "Utilisateur créé avec succès", userId: user.id });
  } catch (error: any) {
    const message = error.message || "Erreur serveur lors de l'inscription.";
    res.status(400).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ message: parseResult.error.issues[0].message });
    return;
  }

  const { email, password } = parseResult.data;
  const { token, error } = await loginUser(email, password);

  if (error) {
    res.status(401).json({ message: error });
    return;
  }

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600000,
  });

  res.json({ message: "Connexion réussie", token });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ message: "Déconnexion réussie" });
};

export const activateUser = async (req: Request, res: Response) => {
  console.log("ActivateUser called");
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ message: "Token manquant" });
    return;
  }

  try {
    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    if (user.isActive) {
      res.status(400).json({ message: "Compte déjà activé" });
      return;
    }
    
    user.isActive = true;
    await user.save();

    res.json({ message: "Compte activé avec succès !" });
  } catch (error) {
    console.log("Entré dans le catch");
    console.error("Erreur activation :", error);
    res.status(400).json({ message: "Token invalide ou expiré" });
  }
};
