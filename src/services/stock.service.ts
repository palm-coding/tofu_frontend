// services/stock.service.ts

import axios from "axios";
import type {
  StocksResponse,
  StockResponse,
  AdjustStockDto,
} from "@/interfaces/stock.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const stockService = {
  // Get all stocks for a specific branch
  getStocks: async (branchId: string): Promise<StocksResponse> => {
    console.log(`Fetching stocks for branch ${branchId}`);
    try {
      const response = await api.get(`/stocks/`);
      console.log("Fetched stocks:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
      throw error;
    }
  },

  // Get a specific stock item
  getStockById: async (
    branchId: string,
    stockId: string
  ): Promise<StockResponse> => {
    console.log(`Fetching stock ${stockId} for branch ${branchId}`);
    try {
      const response = await api.get(`/branches/stocks/${stockId}`);
      console.log("Fetched stock:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stock ${stockId}:`, error);
      throw error;
    }
  },

  // Create a new stock entry for a branch
  createStock: async (
    branchId: string,
    ingredientId: string,
    initialQuantity = 0
  ): Promise<StockResponse> => {
    console.log(
      `Creating stock for ingredient ${ingredientId} in branch ${branchId}`
    );
    try {
      const response = await api.post(`/branches/${branchId}/stocks`, {
        ingredientId,
        quantity: initialQuantity,
      });
      console.log("Created stock:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to create stock:", error);
      throw error;
    }
  },

  // Adjust stock quantity (add or remove)
  adjustStock: async (
    branchId: string,
    stockId: string,
    adjustmentData: AdjustStockDto
  ): Promise<StockResponse> => {
    console.log("Adjusting stock with:", {
      url: `/stocks/${stockId}/adjust`,
      method: "PATCH",
      body: adjustmentData, // ✅ Only quantity & type here
    });

    try {
      const response = await api.patch(
        `/stocks/${stockId}/adjust`,
        adjustmentData // ✅ No stockId in the body
      );

      console.log("Stock adjustment response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adjusting stock ${stockId}:`, error);
      throw error;
    }
  },
  // Update stock threshold for low stock alerts
  updateThreshold: async (
    branchId: string,
    stockId: string,
    threshold: number
  ): Promise<StockResponse> => {
    console.log(
      `Updating threshold for stock ${stockId} in branch ${branchId} to ${threshold}`
    );
    try {
      const response = await api.patch(
        `/branches/${branchId}/stocks/${stockId}/threshold`,
        { threshold }
      );
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
      await api.delete(`/branches/${branchId}/stocks/${stockId}`);
      console.log("Stock deleted successfully");
    } catch (error) {
      console.error(`Failed to delete stock ${stockId}:`, error);
      throw error;
    }
  },

  // Get low stock items for a branch
  getLowStockItems: async (branchId: string): Promise<StocksResponse> => {
    console.log(`Fetching low stock items for branch ${branchId}`);
    try {
      const response = await api.get(`/branches/${branchId}/stocks/low-stock`);
      console.log("Fetched low stock items:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch low stock items:", error);
      throw error;
    }
  },

  // Bulk update stocks (useful for inventory reconciliation)
  bulkUpdateStocks: async (
    branchId: string,
    updates: Array<{ stockId: string; quantity: number }>
  ): Promise<StocksResponse> => {
    console.log(`Bulk updating stocks for branch ${branchId}:`, updates);
    try {
      const response = await api.patch(
        `/branches/${branchId}/stocks/bulk-update`,
        {
          updates,
        }
      );
      console.log("Bulk updated stocks:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to bulk update stocks:", error);
      throw error;
    }
  },
};
