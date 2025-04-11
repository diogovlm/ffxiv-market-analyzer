import { Response } from "express";

export const handleError = (
  res: Response,
  error: any,
  defaultMsg: string = "An error occurred"
): void => {
  console.error(error.response?.data || error.message || error);
  res.status(500).json({ error: error.response?.data || defaultMsg });
};
