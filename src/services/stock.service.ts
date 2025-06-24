// services/stock.service.ts

import axios from "axios";
import type { StockResponse } from "@/interfaces/stock.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const stockService = {
  // Get all stocks
  getStocks: async (branchId?: string): Promise<StockResponse> => {
    console.log(`Fetching stocks${branchId ? ` for branch ${branchId}` : ""}`);
    try {
      const response = await api.get(`/stocks`);
      console.log("Fetched stocks:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      throw error;
    }
  },

  // Get a specific stock item by ID
  getStockById: async (stockId: string): Promise<StockResponse> => {
    console.log(`Fetching stock ${stockId}`);
    try {
      const response = await api.get(`/stocks/${stockId}`);
      console.log("Fetched stock:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stock ${stockId}:`, error);
      throw error;
    }
  },

  // Create a new stock entry
  createStock: async (
    branchId: string,
    ingredientId: string,
    initialQuantity = 0
  ): Promise<StockResponse> => {
    console.log(
      `Creating stock for ingredient ${ingredientId} in branch ${branchId}`
    );
    try {
      const response = await api.post(`/stocks`, {
        branchId,
        ingredientId,
        quantity: initialQuantity,
        lowThreshold: 10,
      });
      console.log("Created stock:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to create stock:", error);
      throw error;
    }
  },

  // Update stock (general update)
  updateStock: async (
    stockId: string,
    data: { quantity?: number; lowThreshold?: number }
  ): Promise<StockResponse> => {
    console.log(`Updating stock ${stockId}:`, data);
    try {
      const response = await api.patch(`/stocks/${stockId}`, data);
      console.log("Updated stock:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to update stock:", error);
      throw error;
    }
  },

  // Adjust stock quantity (ใช้ endpoint ที่เฉพาะเจาะจง)
  adjustStock: async (
    stockId: string,
    adjustmentData: {
      type: "add" | "remove"; // เปลี่ยนจาก "subtract" เป็น "remove"
      quantity: number;
      reason?: string;
    }
  ): Promise<StockResponse> => {
    console.log(`Adjusting stock ${stockId}:`, adjustmentData);
    try {
      const response = await api.patch(
        `/stocks/${stockId}/adjust`,
        adjustmentData
      );
      console.log("Adjusted stock:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to adjust stock ${stockId}:`, error);
      throw error;
    }
  },

  // Update stock threshold for low stock alerts (ใช้ updateStock แทน)
  updateThreshold: async (
    stockId: string,
    threshold: number
  ): Promise<StockResponse> => {
    console.log(`Updating threshold for stock ${stockId} to ${threshold}`);
    try {
      const response = await api.patch(`/stocks/${stockId}`, {
        lowThreshold: threshold,
      });
      console.log("Updated threshold:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update threshold for stock ${stockId}:`, error);
      throw error;
    }
  },

  // Delete a stock entry
  deleteStock: async (branchId: string, stockId: string): Promise<void> => {
    console.log(`Deleting stock ${stockId} from branch ${branchId}`);
    try {
      await api.delete(`/stocks/${stockId}`);
      console.log("Stock deleted successfully");
    } catch (error) {
      console.error(`Failed to delete stock ${stockId}:`, error);
      throw error;
    }
  },

  // Get low stock items
  getLowStockItems: async (): Promise<StockResponse> => {
    console.log("Fetching low stock items");
    try {
      const response = await api.get(`/stocks/low-stock`);
      console.log("Fetched low stock items:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch low stock items:", error);
      throw error;
    }
  },

  // Bulk adjust stocks (ใช้ endpoint ที่มีอยู่)
  bulkAdjustStocks: async (
    adjustments: Array<{
      stockId: string;
      type: "add" | "subtract" | "set";
      quantity: number;
      reason?: string;
    }>
  ): Promise<StockResponse> => {
    console.log("Bulk adjusting stocks:", adjustments);
    try {
      const response = await api.patch(`/stocks/bulk-adjust`, {
        adjustments,
      });
      console.log("Bulk adjusted stocks:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to bulk adjust stocks:", error);
      throw error;
    }
  },
};
