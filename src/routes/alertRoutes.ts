import express from "express";
import {
  triggerAlertScan,
  getAlerts,
  getAlertToggle,
  setAlertToggle,
} from "../controllers/alertController";

const router = express.Router();

router.post("/scan", triggerAlertScan);
router.get("/", getAlerts);
router.get("/toggle", getAlertToggle);
router.post("/toggle", setAlertToggle);

export default router;
