export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  imageUrl: string;
}

export interface NewMenuItemDto {
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
