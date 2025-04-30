import { Request, Response } from "express";
import { fetchRecipesPerItem } from "../services/craftingService";
import { calculateProfit } from "../services/profitService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getCraftingProfit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId, world } = req.params;

    const recipe = await fetchRecipesPerItem(itemId);
    const profitData = await calculateProfit(recipe, world);

    sendSuccess(res, {
      recipe,
      ...profitData,
      isProfitable: profitData.profit > 0,
    });
  } catch (error) {
    sendError(res, error, "Failed to calculate crafting profit");
  }
};
