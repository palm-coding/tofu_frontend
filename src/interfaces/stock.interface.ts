export interface Stock {
  _id: string;
  ingredientId: string | any;
  quantity: number;
  lowThreshold: number;
  threshold?: number;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIngredientDto {
  name: string;
  unit: string;
}

export interface AdjustStockDto {
  quantity: number;
  type: "add" | "remove"; // or whatever your backend expects
}

export interface StockAdjustment {
  id: string;
  stockId: string;
  quantity: number;
  type: "add" | "remove";
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockResponse {
  success: boolean;
  stock: Stock;
  message?: string;
}

export interface StocksResponse {
  success: boolean;
  stocks: Stock[];
  data?: Stock[];
  message?: string;
}
