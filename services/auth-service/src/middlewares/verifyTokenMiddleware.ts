import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError, AuthError } from "../errors/CustomErrors";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyTokenMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) throw new AuthError("Token manquant");

    const secret = process.env.JWT_SECRET;
    if (!secret) 
      throw new AppError(
        "JWT_SECRET non défini dans les variables d’environnement",
        500
      );

    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AuthError || error instanceof AppError)
      return next(error);
    
    return next(new AuthError("Token invalide ou expiré"));
  }
};

export default verifyTokenMiddleware;