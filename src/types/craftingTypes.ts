export interface Ingredient {
  id: string;
  quantity: number;
  name?: string;
  icon?: string;
}

export interface RecipeDetail {
  recipeId: string;
  isExpert: boolean;
  ingredients: Ingredient[];
}
