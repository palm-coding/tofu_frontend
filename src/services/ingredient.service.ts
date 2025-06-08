import axios from "axios";
import {
  CreateIngredientDto,
  UpdateIngredientDto,
  IngredientResponse,
} from "@/interfaces/ingredient.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const ingredientService = {
  // Fetch all ingredients
  getIngredients: async (): Promise<IngredientResponse> => {
    console.log("Fetching available ingredients");
    try {
      const response = await api.get(`/ingredients`);
      console.log("Fetched ingredients:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      throw error;
    }
  },

  addIngredient: async (
    data: CreateIngredientDto
  ): Promise<IngredientResponse> => {
    try {
      const response = await api.post("/ingredients", data);
      return response.data;
    } catch (error: unknown) {
      console.error("❌ Failed to add ingredient");

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with a status code not in 2xx
          console.error("🔴 Server response error:", error.response.data);
          console.error("🔴 Status code:", error.response.status);
        } else if (error.request) {
          // Request was made but no response received
          console.error("🔴 No response received:", error.request);
        } else {
          // Something went wrong setting up the request
          console.error("🔴 Request setup error:", error.message);
        }
      } else {
        console.error("🔴 Unknown error:", error);
      }

      throw error;
    }
  },

  // Update ingredient
  update: async (
    ingredientId: string,
    data: UpdateIngredientDto
  ): Promise<IngredientResponse> => {
    try {
      const response = await api.put(`/ingredients/${ingredientId}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update ingredient ${ingredientId}:`, error);
      throw error;
    }
  },

  // Delete ingredient
  delete: async (ingredientId: string): Promise<void> => {
    try {
      await api.delete(`/ingredients/${ingredientId}`);
    } catch (error) {
      console.error(`Failed to delete ingredient ${ingredientId}:`, error);
      throw error;
    }
  },
};
