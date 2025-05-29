import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateBody =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }
    req.body = validation.data;
    next();
  };
