import express from "express";
import {
  getDataCenterMarketData,
  getWorldMarketData,
  getArbitrageData,
  getArbitrageDataDC,
} from "../controllers/marketController";

const router = express.Router();

router.get("/:world/:itemId", getWorldMarketData);
router.get("/:dataCenter/:itemId", getDataCenterMarketData);
router.get("/arbitrage/:sellWorld/:itemId", getArbitrageData);
router.get("/arbitrage-dc/:sellWorld/:itemId", getArbitrageDataDC);

export default router;
