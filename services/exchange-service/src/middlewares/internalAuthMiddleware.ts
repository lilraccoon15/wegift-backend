import { Request, Response, NextFunction } from "express";
import { AuthError } from "../errors/CustomErrors";

export const internalAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const internalToken = req.headers.authorization?.replace("Bearer ", "");

    if (internalToken !== process.env.INTERNAL_API_TOKEN) {
        return next(new AuthError("Accès interdit à la route interne"));
    }

    next();
};
