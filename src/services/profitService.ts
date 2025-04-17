import { fetchMarketData } from "./marketService";
import { RecipeDetail } from "../types/craftingTypes";

export const calculateProfit = async (
  recipe: RecipeDetail,
  world: string
): Promise<{
  totalMaterialCost: number;
  finalProductPrice: number;
  profit: number;
}> => {
  let totalMaterialCost = 0;

  for (const ingredient of recipe.ingredients) {
    const marketData = await fetchMarketData(world, ingredient.id);
    const pricePerUnit = marketData?.listings[0].pricePerUnit ?? 0;
    totalMaterialCost += pricePerUnit * ingredient.quantity;
  }

  const finalProductMarketData = await fetchMarketData(world, recipe.recipeId);
  const finalProductPrice =
    finalProductMarketData?.listings[0].pricePerUnit ?? 0;

  const profit =
    finalProductPrice * recipe.quantityPerCraft - totalMaterialCost;

  return {
    totalMaterialCost,
    finalProductPrice,
    profit,
  };
};
