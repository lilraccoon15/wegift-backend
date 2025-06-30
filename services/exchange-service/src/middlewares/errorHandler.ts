import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

import {
    AppError,
    AuthError,
    ConflictError,
    NotFoundError,
    ValidationError,
} from "../errors/CustomErrors";

export default function errorHandler(
    err: Error & { statusCode?: number },
    req: Request,
    res: Response,
    next: NextFunction
) {
    logger.error(err);

    const safeMessage =
        typeof err.message === "string" && err.message.length < 500
            ? err.message
            : "Erreur inattendue";

    if (
        err instanceof ValidationError ||
        err instanceof NotFoundError ||
        err instanceof ConflictError ||
        err instanceof AuthError
    ) {
        res.status(err.statusCode || 500).json({ message: safeMessage });
        return;
    }

    if (err instanceof AppError && err.statusCode) {
        res.status(err.statusCode).json({ message: safeMessage });
        return;
    }

    res.status(500).json({ message: "Erreur serveur inattendue" });
}
