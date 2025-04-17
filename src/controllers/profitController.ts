import { Request, Response } from "express";
import { fetchRecipesPerItem } from "../services/craftingService";
import { calculateProfit } from "../services/profitService";

export const getCraftingProfit = async (req: Request, res: Response) => {
  try {
    const { itemId, world } = req.params;

    const recipe = await fetchRecipesPerItem(itemId);
    const profitData = await calculateProfit(recipe, world);

    res.json({
      recipe,
      ...profitData,
      isProfitable: profitData.profit > 0,
    });
  } catch (error: any) {
    console.error("Error calculating crafting profit:", error);
    res.status(500).json({ error: "Failed to calculate crafting profit" });
  }
};
