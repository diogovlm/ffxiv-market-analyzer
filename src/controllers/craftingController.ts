import { Request, Response } from "express";
import { fetchRecipesPerItem } from "../services/craftingService";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getCraftingRecipes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      sendError(res, null, "Item ID is required", 400);
      return;
    }

    const recipes = await fetchRecipesPerItem(itemId);
    sendSuccess(res, recipes);
  } catch (error: any) {
    const msg = error.message.includes("No recipes found")
      ? error.message
      : "Failed to fetch crafting recipes";
    sendError(res, error, msg);
  }
};
