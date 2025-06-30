import { Request, Response, NextFunction, RequestHandler } from "express";
import logger from "../utils/logger";
import { AppError } from "../errors/CustomErrors";

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
    return (req, res, next) => {
        fn(req, res, next).catch((error: unknown) => {
            if (error instanceof AppError) return next(error);
            logger.error(error);
            next(error);
        });
    };
}
