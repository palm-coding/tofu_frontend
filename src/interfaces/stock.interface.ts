export interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export interface Stock {
  id: string;
  branchId: string;
  ingredientId: string;
  quantity: number;
  lowThreshold: number;
}

export interface StockWithIngredient extends Stock {
  ingredient: Ingredient;
}

// DTOs for API requests
export interface CreateIngredientDto {
  name: string;
  unit: string;
}

export interface UpdateIngredientDto {
  name?: string;
  unit?: string;
}

export interface AdjustStockDto {
  quantity: number;
  type: "add" | "remove";
}

export interface UpdateThresholdDto {
  lowThreshold: number;
}

// API responses
export interface IngredientsResponse {
  ingredients: Ingredient[];
}

export interface IngredientResponse {
  ingredient: Ingredient;
}

export interface StocksResponse {
  stocks: Stock[];
}

export interface StockResponse {
  stock: Stock;
}
