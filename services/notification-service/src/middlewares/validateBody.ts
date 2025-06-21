import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/CustomErrors";
import { ZodSchema } from "zod";

export const validateBody =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return next(
        new ValidationError(validation.error.issues[0].message)
      );
    }
    req.body = validation.data;
    next();
  };
