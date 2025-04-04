import express from "express";
import {
  getDataCenterMarketData,
  getWorldMarketData,
} from "../controllers/marketController";

const router = express.Router();

router.get("/:world/:itemId", getWorldMarketData);
router.get("/:dataCenter/:itemId", getDataCenterMarketData);

export default router;
