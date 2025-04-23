import cron from "node-cron";
import { scanForAlerts } from "../services/alertScanner";

export const scheduleAlertJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("🕒 Running hourly alert scan...");
    await scanForAlerts();
  });
};
