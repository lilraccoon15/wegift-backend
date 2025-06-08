import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./verifyTokenMiddleware";
import { AuthError } from "src/errors/CustomErrors";

export const ensureAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.id) throw new AuthError("Non autorisé");
  next();
};