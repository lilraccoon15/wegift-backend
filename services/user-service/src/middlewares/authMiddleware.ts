import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyTokenMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ message: 'Token manquant' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET non défini dans les variables d’environnement');
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
    return;
  }
};
