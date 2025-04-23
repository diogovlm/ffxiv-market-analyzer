import express from "express";
import { triggerAlertScan, getAlerts } from "../controllers/alertController";

const router = express.Router();

router.post("/scan", triggerAlertScan);
router.get("/", getAlerts);

export default router;
