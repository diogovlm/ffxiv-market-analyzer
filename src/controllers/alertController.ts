import { Request, Response } from "express";
import { scanForAlerts } from "../services/alertScanner";
import { Alert } from "../models/Alert";
import { handleError } from "../utils/errorHandler";

export const triggerAlertScan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = req.body ?? {};
    await scanForAlerts(filters);
    res.json({ message: "Alert scan started" });
  } catch (error: any) {
    handleError(res, error, "Failed to start alert scan");
  }
};

export const getAlerts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const alerts = await Alert.find().sort({ profit: -1 });
    res.json(alerts);
  } catch (error: any) {
    handleError(res, error, "Failed to fetch alerts");
  }
};
