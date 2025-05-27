import axios from "axios";
import {
  CategoriesResponse,
  MenuItemsResponse,
  MenuItemResponse,
  CategoryResponse,
  NewMenuItemDto,
  UpdateMenuItemDto,
} from "@/interfaces/menu.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const menuService = {
  // Category services
  getCategories: async (branchId: string): Promise<CategoriesResponse> => {
    console.log(`Fetching categories for branch ${branchId}`);
    try {
      const response = await api.get(`/menu-categories/branch/${branchId}`);
      console.log("Fetched categories:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  },

  createCategory: async (
    branchId: string,
    name: string
  ): Promise<CategoryResponse> => {
    try {
      const response = await api.post(`/menu-categories`, {
        name,
        branchId,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  updateCategory: async (
    categoryId: string,
    name: string
  ): Promise<CategoryResponse> => {
    try {
      const response = await api.patch(`/menu-categories/${categoryId}`, {
        name,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update category ${categoryId}:`, error);
      throw error;
    }
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    try {
      await api.delete(`/menu-categories/${categoryId}`);
      return;
    } catch (error) {
      console.error(`Failed to delete category ${categoryId}:`, error);
      throw error;
    }
  },

  // Menu item services
  getMenuItems: async (
    branchId?: string,
    categoryId?: string
  ): Promise<MenuItemsResponse> => {
    console.log(`Fetching menu items for branch ${branchId}`);
    try {
      // Build query parameters
      let url = "/menu-items";
      const params = new URLSearchParams();

      if (branchId) {
        params.append("branchId", branchId);
      }

      if (categoryId) {
        params.append("categoryId", categoryId);
      }

      // Append query string if there are parameters
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      console.log("Fetching menu items:", response.data);

      return response.data;
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      throw error;
    }
  },

  createMenuItem: async (
    itemData: NewMenuItemDto
  ): Promise<MenuItemResponse> => {
    try {
      const response = await api.post(`/menu-items`, itemData);
      return response.data;
    } catch (error) {
      console.error("Failed to create menu item:", error);
      throw error;
    }
  },

  updateMenuItem: async (
    itemId: string,
    itemData: UpdateMenuItemDto
  ): Promise<MenuItemResponse> => {
    try {
      const response = await api.patch(`/menu-items/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update menu item ${itemId}:`, error);
      throw error;
    }
  },

  toggleMenuItemAvailability: async (
    itemId: string
  ): Promise<MenuItemResponse> => {
    try {
      const response = await api.patch(
        `/menu-items/${itemId}/toggle-availability`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to toggle menu item availability ${itemId}:`,
        error
      );
      throw error;
    }
  },

  deleteMenuItem: async (itemId: string): Promise<void> => {
    try {
      await api.delete(`/menu-items/${itemId}`);
      return;
    } catch (error) {
      console.error(`Failed to delete menu item ${itemId}:`, error);
      throw error;
    }
  },
};
