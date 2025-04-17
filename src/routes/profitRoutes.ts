import express from "express";
import { getCraftingProfit } from "../controllers/profitController";

const router = express.Router();

router.get("/:itemId/:world", getCraftingProfit);

export default router;
