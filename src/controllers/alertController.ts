import { Request, Response } from "express";
import { scanForAlerts } from "../services/alertScanner";
import { Alert } from "../models/Alert";
import AlertToggle from "../models/AlertToggle";
import { getItemName } from "../services/itemNameService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const triggerAlertScan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = req.body ?? {};
    await scanForAlerts(filters);
    sendSuccess(res, { message: "Alert scan started" });
  } catch (error) {
    sendError(res, error, "Failed to start alert scan");
  }
};

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await Alert.find().lean();
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const itemName = await getItemName(alert.itemId);
        return { ...alert, itemName };
      })
    );
    sendSuccess(res, enrichedAlerts);
  } catch (error) {
    sendError(res, error, "Failed to fetch alerts");
  }
};

export const getAlertToggle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const toggle = await AlertToggle.findOne();
    sendSuccess(res, { enabled: toggle?.enabled ?? true });
  } catch (error) {
    sendError(res, error, "Failed to fetch alert toggle");
  }
};

export const setAlertToggle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      sendError(res, null, "Invalid value for enabled", 400);
      return;
    }
    const toggle = await AlertToggle.findOneAndUpdate(
      {},
      { enabled, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    sendSuccess(res, {
      message: `Alert scanning ${enabled ? "enabled" : "disabled"}`,
      toggle,
    });
  } catch (error) {
    sendError(res, error, "Failed to set alert toggle");
  }
};
