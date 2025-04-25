import { Request, Response } from "express";
import { scanForAlerts } from "../services/alertScanner";
import { Alert } from "../models/Alert";
import { handleError } from "../utils/errorHandler";
import { getItemName } from "../services/itemNameService";
import AlertToggle from "../models/AlertToggle";

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

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await Alert.find().lean();

    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        const itemName = await getItemName(alert.itemId);
        return { ...alert, itemName };
      })
    );

    res.json(enrichedAlerts);
  } catch (error: any) {
    console.error("Error fetching alerts:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAlertToggle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const toggle = await AlertToggle.findOne();
    res.status(200).json({ enabled: toggle?.enabled ?? true });
  } catch (error) {
    console.error("Error fetching alert toggle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setAlertToggle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      res.status(400).json({ error: "Invalid value for enabled" });
      return;
    }

    const toggle = await AlertToggle.findOneAndUpdate(
      {},
      { enabled, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: `Alert scanning ${enabled ? "enabled" : "disabled"}`,
      toggle,
    });
  } catch (error) {
    console.error("Error setting alert toggle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
