import type { Ingredient } from "./ingredient.interface";
import type { Branch } from "./branch.interface"; // ถ้ามี

export interface Stock {
  _id: string;
  branchId: Branch | string;
  ingredientId: Ingredient;
  quantity: number;
  lowThreshold: number;
  updatedAt: string;
  __v: number;
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
  stocks: Stock[];
  data?: Stock[];
  message?: string;
}
