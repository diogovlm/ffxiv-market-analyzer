import { Request, Response } from "express";
import { fetchRecipesPerItem } from "../services/craftingService";
import { handleError } from "../utils/errorHandler";

export const getCraftingRecipes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId } = req.params;
    if (!itemId) {
      res.status(400).json({ error: "Item ID is required" });
      return;
    }

    const recipes = await fetchRecipesPerItem(itemId);

    res.json(recipes);
  } catch (error: any) {
    if (error.message.includes("No recipes found")) {
      handleError(res, error, error.message);
    } else {
      handleError(res, error, "Failed to fetch crafting recipes");
    }
  }
};
