// import axios from "axios";
import {
  MenuCategory,
  MenuItem,
  CategoriesResponse,
  MenuItemsResponse,
  MenuItemResponse,
  CategoryResponse,
  NewMenuItemDto,
  UpdateMenuItemDto,
} from "@/interfaces/menu.interface";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// Mock data for menu categories
const mockCategories: MenuCategory[] = [
  { id: "cat1", name: "เครื่องดื่ม" },
  { id: "cat2", name: "ของทานเล่น" },
  { id: "cat3", name: "ของหวาน" },
];

// Mock data for menu items
const mockMenuItems: MenuItem[] = [
  {
    id: "item1",
    name: "น้ำเต้าหู้ร้อน",
    description: "น้ำเต้าหู้ร้อนสูตรดั้งเดิม",
    price: 25,
    categoryId: "cat1",
    isAvailable: true,
    imageUrl: "/img/soy01.png",
  },
  {
    id: "item2",
    name: "น้ำเต้าหู้เย็น",
    description: "น้ำเต้าหู้เย็นหวานชื่นใจ",
    price: 30,
    categoryId: "cat1",
    isAvailable: true,
    imageUrl: "/img/soy02.jpg",
  },
  {
    id: "item3",
    name: "น้ำเต้าหู้ปั่น",
    description: "น้ำเต้าหู้ปั่นเข้มข้น",
    price: 35,
    categoryId: "cat1",
    isAvailable: true,
    imageUrl: "/img/soy03.jpg",
  },
  {
    id: "item4",
    name: "ปาท่องโก๋",
    description: "ปาท่องโก๋ทอดกรอบ",
    price: 10,
    categoryId: "cat2",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "item5",
    name: "ขนมไข่",
    description: "ขนมไข่หอมนุ่ม",
    price: 15,
    categoryId: "cat2",
    isAvailable: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "item6",
    name: "เต้าฮวยฟรุตสลัด",
    description: "เต้าฮวยราดผลไม้รวม",
    price: 45,
    categoryId: "cat3",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
];

export const menuService = {
  // Category services
  getCategories: async (branchId: string): Promise<CategoriesResponse> => {
    console.log(`Fetching categories for branch ${branchId}`);
    try {
      // In a real app, we would call the API:
      // const response = await api.get(`/branches/${branchId}/categories`);
      // return response.data;

      // For now, simulate API call with mock data
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ categories: mockCategories });
        }, 500); // Simulate network delay
      });
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
      // In a real app:
      // const response = await api.post(`/branches/${branchId}/categories`, { name });
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const newCategory: MenuCategory = {
            id: `cat${Date.now()}`,
            name,
          };
          mockCategories.push(newCategory);

          resolve({ category: newCategory });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  updateCategory: async (
    branchId: string,
    categoryId: string,
    name: string
  ): Promise<CategoryResponse> => {
    try {
      // In a real app:
      // const response = await api.put(`/branches/${branchId}/categories/${categoryId}`, { name });
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const categoryIndex = mockCategories.findIndex(
            (c) => c.id === categoryId
          );

          if (categoryIndex === -1) {
            reject(new Error("Category not found"));
            return;
          }

          mockCategories[categoryIndex] = {
            ...mockCategories[categoryIndex],
            name,
          };

          resolve({ category: mockCategories[categoryIndex] });
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to update category ${categoryId}:`, error);
      throw error;
    }
  },

  deleteCategory: async (
    branchId: string,
    categoryId: string
  ): Promise<void> => {
    try {
      // In a real app:
      // await api.delete(`/branches/${branchId}/categories/${categoryId}`);
      // return;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const categoryIndex = mockCategories.findIndex(
            (c) => c.id === categoryId
          );

          if (categoryIndex === -1) {
            reject(new Error("Category not found"));
            return;
          }

          // Check if there are items in this category
          const hasItems = mockMenuItems.some(
            (item) => item.categoryId === categoryId
          );

          if (hasItems) {
            reject(new Error("Cannot delete category with menu items"));
            return;
          }

          mockCategories.splice(categoryIndex, 1);
          resolve();
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to delete category ${categoryId}:`, error);
      throw error;
    }
  },

  // Menu item services
  getMenuItems: async (branchId: string): Promise<MenuItemsResponse> => {
    console.log(`Fetching menu items for branch ${branchId}`);
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/menu-items`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ items: mockMenuItems });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      throw error;
    }
  },

  createMenuItem: async (
    branchId: string,
    itemData: NewMenuItemDto
  ): Promise<MenuItemResponse> => {
    try {
      // In a real app:
      // const response = await api.post(`/branches/${branchId}/menu-items`, itemData);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const newItem: MenuItem = {
            id: `item${Date.now()}`,
            name: itemData.name,
            description: itemData.description,
            price: Number(itemData.price),
            categoryId: itemData.categoryId,
            isAvailable: itemData.isAvailable,
            imageUrl:
              itemData.imageUrl || "/placeholder.svg?height=100&width=100",
          };

          mockMenuItems.push(newItem);
          resolve({ item: newItem });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to create menu item:", error);
      throw error;
    }
  },

  updateMenuItem: async (
    branchId: string,
    itemId: string,
    itemData: UpdateMenuItemDto
  ): Promise<MenuItemResponse> => {
    try {
      // In a real app:
      // const response = await api.put(`/branches/${branchId}/menu-items/${itemId}`, itemData);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const itemIndex = mockMenuItems.findIndex((i) => i.id === itemId);

          if (itemIndex === -1) {
            reject(new Error("Menu item not found"));
            return;
          }

          const updatedItem = {
            ...mockMenuItems[itemIndex],
            ...itemData,
            // Ensure price is a number
            price:
              itemData.price !== undefined
                ? Number(itemData.price)
                : mockMenuItems[itemIndex].price,
          };

          mockMenuItems[itemIndex] = updatedItem;
          resolve({ item: updatedItem });
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to update menu item ${itemId}:`, error);
      throw error;
    }
  },

  toggleMenuItemAvailability: async (
    branchId: string,
    itemId: string
  ): Promise<MenuItemResponse> => {
    try {
      // In a real app:
      // const response = await api.patch(`/branches/${branchId}/menu-items/${itemId}/toggle-availability`);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const itemIndex = mockMenuItems.findIndex((i) => i.id === itemId);

          if (itemIndex === -1) {
            reject(new Error("Menu item not found"));
            return;
          }

          const updatedItem = {
            ...mockMenuItems[itemIndex],
            isAvailable: !mockMenuItems[itemIndex].isAvailable,
          };

          mockMenuItems[itemIndex] = updatedItem;
          resolve({ item: updatedItem });
        }, 500);
      });
    } catch (error) {
      console.error(
        `Failed to toggle menu item availability ${itemId}:`,
        error
      );
      throw error;
    }
  },

  deleteMenuItem: async (branchId: string, itemId: string): Promise<void> => {
    try {
      // In a real app:
      // await api.delete(`/branches/${branchId}/menu-items/${itemId}`);
      // return;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const itemIndex = mockMenuItems.findIndex((i) => i.id === itemId);

          if (itemIndex === -1) {
            reject(new Error("Menu item not found"));
            return;
          }

          mockMenuItems.splice(itemIndex, 1);
          resolve();
        }, 500);
      });
    } catch (error) {
      console.error(`Failed to delete menu item ${itemId}:`, error);
      throw error;
    }
  },
};
