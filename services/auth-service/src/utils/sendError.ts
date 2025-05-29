import { Response } from "express";

export default function sendError(
  res: Response,
  message: string,
  status = 400,
  data: any = {}
) {
  res.status(status).json({
    success: false,
    message,
    ...(Object.keys(data).length > 0 && { data }),
  });
}