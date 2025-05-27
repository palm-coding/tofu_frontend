export interface MenuCategory {
  _id: string;
  branchId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface MenuItem {
  _id: string;
  branchId: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface NewMenuItemDto {
  branchId: string;
  name: string;
  description: string;
  price: number | string; // Handle form input
  categoryId: string;
  isAvailable: boolean;
  imageUrl: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number | string;
  categoryId?: string;
  isAvailable?: boolean;
  imageUrl?: string;
}

// API response interfaces
export interface CategoriesResponse {
  categories: MenuCategory[];
}

export interface MenuItemsResponse {
  items: MenuItem[];
}

export interface MenuItemResponse {
  item: MenuItem;
}

export interface CategoryResponse {
  category: MenuCategory;
}
