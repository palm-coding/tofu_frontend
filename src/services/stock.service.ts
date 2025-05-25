// import axios from "axios";
import {
  AdjustStockDto,
  CreateIngredientDto,
  Ingredient,
  IngredientResponse,
  IngredientsResponse,
  Stock,
  StockResponse,
  StocksResponse,
  UpdateIngredientDto,
  UpdateThresholdDto,
} from "@/interfaces/stock.interface";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// Mock data for ingredients
const mockIngredients: Ingredient[] = [
  { id: "ing1", name: "ถั่วเหลือง", unit: "กิโลกรัม" },
  { id: "ing2", name: "น้ำตาล", unit: "กิโลกรัม" },
  { id: "ing3", name: "แป้ง", unit: "กิโลกรัม" },
  { id: "ing4", name: "น้ำแข็ง", unit: "กิโลกรัม" },
  { id: "ing5", name: "นมข้นหวาน", unit: "กระป๋อง" },
];

// Mock data for stock
const mockStocks: Stock[] = [
  {
    id: "stock1",
    branchId: "branch1",
    ingredientId: "ing1",
    quantity: 25,
    lowThreshold: 5,
  },
  {
    id: "stock2",
    branchId: "branch1",
    ingredientId: "ing2",
    quantity: 10,
    lowThreshold: 3,
  },
  {
    id: "stock3",
    branchId: "branch1",
    ingredientId: "ing3",
    quantity: 15,
    lowThreshold: 5,
  },
  {
    id: "stock4",
    branchId: "branch1",
    ingredientId: "ing4",
    quantity: 2,
    lowThreshold: 5,
  },
  {
    id: "stock5",
    branchId: "branch1",
    ingredientId: "ing5",
    quantity: 8,
    lowThreshold: 3,
  },
];

export const stockService = {
  // Get all ingredients
  getIngredients: async (): Promise<IngredientsResponse> => {
    try {
      // In a real app, we would call the API:
      // const response = await api.get('/ingredients');
      // return response.data;

      // For now, simulate API call with mock data
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ ingredients: mockIngredients });
        }, 500); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      throw error;
    }
  },

  // Get stocks for a specific branch
  getStocks: async (branchId: string): Promise<StocksResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/stocks`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const branchStocks = mockStocks.filter(
            (stock) => stock.branchId === branchId
          );
          resolve({ stocks: branchStocks });
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to fetch stocks for branch ${branchId}:`, error);
      throw error;
    }
  },

  // Add a new ingredient
  addIngredient: async (
    ingredientData: CreateIngredientDto
  ): Promise<IngredientResponse> => {
    try {
      // In a real app:
      // const response = await api.post('/ingredients', ingredientData);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const newIngredient: Ingredient = {
            id: `ing${Date.now()}`,
            name: ingredientData.name,
            unit: ingredientData.unit,
          };

          mockIngredients.push(newIngredient);
          resolve({ ingredient: newIngredient });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to create ingredient:", error);
      throw error;
    }
  },

  // Update an existing ingredient
  updateIngredient: async (
    ingredientId: string,
    updateData: UpdateIngredientDto
  ): Promise<IngredientResponse> => {
    try {
      // In a real app:
      // const response = await api.put(`/ingredients/${ingredientId}`, updateData);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockIngredients.findIndex(
            (ing) => ing.id === ingredientId
          );

          if (index === -1) {
            reject(new Error("Ingredient not found"));
            return;
          }

          const updatedIngredient = {
            ...mockIngredients[index],
            ...updateData,
          };

          mockIngredients[index] = updatedIngredient;
          resolve({ ingredient: updatedIngredient });
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to update ingredient ${ingredientId}:`, error);
      throw error;
    }
  },

  // Delete an ingredient
  deleteIngredient: async (ingredientId: string): Promise<void> => {
    try {
      // In a real app:
      // await api.delete(`/ingredients/${ingredientId}`);
      // return;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockIngredients.findIndex(
            (ing) => ing.id === ingredientId
          );

          if (index === -1) {
            reject(new Error("Ingredient not found"));
            return;
          }

          mockIngredients.splice(index, 1);

          // Also remove related stocks
          const stocksToRemove = mockStocks.filter(
            (stock) => stock.ingredientId === ingredientId
          );

          stocksToRemove.forEach((stockToRemove) => {
            const stockIndex = mockStocks.findIndex(
              (s) => s.id === stockToRemove.id
            );
            if (stockIndex !== -1) {
              mockStocks.splice(stockIndex, 1);
            }
          });

          resolve();
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to delete ingredient ${ingredientId}:`, error);
      throw error;
    }
  },

  // Create initial stock for an ingredient
  createStock: async (
    branchId: string,
    ingredientId: string
  ): Promise<StockResponse> => {
    try {
      // In a real app:
      // const response = await api.post(`/branches/${branchId}/stocks`, { ingredientId });
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const newStock: Stock = {
            id: `stock${Date.now()}`,
            branchId,
            ingredientId,
            quantity: 0,
            lowThreshold: 5,
          };

          mockStocks.push(newStock);
          resolve({ stock: newStock });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to create stock:", error);
      throw error;
    }
  },

  // Adjust stock quantity
  adjustStock: async (
    branchId: string,
    stockId: string,
    adjustmentData: AdjustStockDto
  ): Promise<StockResponse> => {
    try {
      // In a real app:
      // const response = await api.put(`/branches/${branchId}/stocks/${stockId}/adjust`, adjustmentData);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockStocks.findIndex((s) => s.id === stockId);

          if (index === -1) {
            reject(new Error("Stock not found"));
            return;
          }

          let newQuantity = mockStocks[index].quantity;

          if (adjustmentData.type === "add") {
            newQuantity += adjustmentData.quantity;
          } else {
            newQuantity = Math.max(0, newQuantity - adjustmentData.quantity);
          }

          const updatedStock = {
            ...mockStocks[index],
            quantity: newQuantity,
          };

          mockStocks[index] = updatedStock;
          resolve({ stock: updatedStock });
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to adjust stock ${stockId}:`, error);
      throw error;
    }
  },

  // Update stock threshold
  updateThreshold: async (
    branchId: string,
    stockId: string,
    thresholdData: UpdateThresholdDto
  ): Promise<StockResponse> => {
    try {
      // In a real app:
      // const response = await api.put(`/branches/${branchId}/stocks/${stockId}/threshold`, thresholdData);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockStocks.findIndex((s) => s.id === stockId);

          if (index === -1) {
            reject(new Error("Stock not found"));
            return;
          }

          const updatedStock = {
            ...mockStocks[index],
            lowThreshold: thresholdData.lowThreshold,
          };

          mockStocks[index] = updatedStock;
          resolve({ stock: updatedStock });
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to update threshold for stock ${stockId}:`, error);
      throw error;
    }
  },
};
