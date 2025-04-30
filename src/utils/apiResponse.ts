import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: any,
  statusCode: number = 200
): void => {
  res.status(statusCode).json({ success: true, data });
};

export const sendError = (
  res: Response,
  error: any,
  message: string = "Internal server error",
  statusCode: number = 500
): void => {
  console.error("API ERROR:", error?.response?.data ?? error?.message ?? error);
  res.status(statusCode).json({ success: false, error: message });
};
