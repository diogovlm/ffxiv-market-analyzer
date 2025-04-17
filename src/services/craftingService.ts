import axios from "axios";
import { RecipeDetail } from "../types/craftingTypes";

const TEAMCRAFT_BASE =
  process.env.TEAMCRAFT_API_URL ?? "https://api.ffxivteamcraft.com";
const HASH = process.env.TEAMCRAFT_HASH;

if (!HASH) {
  throw new Error(
    "TEAMCRAFT_HASH environment variable is not set. " +
      "Please obtain the current data version hash (from Teamcraft's network requests) " +
      "and set TEAMCRAFT_HASH in your .env file."
  );
}

export const fetchRecipesPerItem = async (
  itemId: string
): Promise<RecipeDetail> => {
  const url = `${TEAMCRAFT_BASE}/data/recipes-per-item/${HASH}/${itemId}`;
  const { data } = await axios.get<any>(url);

  const recipeList = data[itemId];
  if (!recipeList || recipeList.length === 0) {
    throw new Error(`No recipes found for itemId: ${itemId}`);
  }

  const recipe = recipeList[0];

  const result: RecipeDetail = {
    recipeId: itemId.toString(),
    isExpert: recipe.expert,
    quantityPerCraft: recipe.yields,
    ingredients: recipe.ingredients.map((ing: any) => ({
      id: ing.id.toString(),
      quantity: ing.amount,
      name: ing.name,
      icon: ing.icon,
    })),
  };

  return result;
};
