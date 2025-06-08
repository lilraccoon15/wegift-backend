import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error(err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur serveur';

  res.status(status).json({
    success: false,
    message,
    ...(err.data && { data: err.data }),
  });
}
