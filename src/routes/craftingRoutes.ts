import express from "express";
import { getCraftingRecipes } from "../controllers/craftingController";

const router = express.Router();

router.get("/:itemId", getCraftingRecipes);

export default router;
