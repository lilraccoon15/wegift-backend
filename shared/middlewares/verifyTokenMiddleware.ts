import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: number; email?: string; isActive?: boolean };
}

export const verifyTokenMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined);

    if (!token) {
      res.status(401).json({ message: "Token manquant" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET non défini dans les variables d'environnement");
      res.status(500).json({ message: "Erreur serveur" });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("id" in decoded) ||
      typeof decoded.id !== "number"
    ) {
      res.status(401).json({ message: "Token invalide" });
      return;
    }

    if ("isActive" in decoded && decoded.isActive === false) {
      res.status(403).json({ message: "Compte inactif" });
      return;
    }

    req.user = decoded as JwtPayload & { id: number; email?: string; isActive?: boolean };

    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide ou expiré" });
    return;
  }
};
