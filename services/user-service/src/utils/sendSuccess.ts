import { Response } from "express";

export default function sendSuccess(
  res: Response,
  message: string,
  data: any = {},
  status = 200
) {
  res.status(status).json({
    success: true,
    message,
    data,
  });
}