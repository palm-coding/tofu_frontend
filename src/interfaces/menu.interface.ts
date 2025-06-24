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
  imageUrl?: string; // Made optional since it might not always exist
  imagePublicId?: string; // Add this for Cloudinary
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface NewMenuItemDto {
  branchId: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  imageUrl?: string; // Add for Cloudinary URL
  imagePublicId?: string; // Add for Cloudinary public ID
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number | string;
  categoryId?: string;
  isAvailable?: boolean;
  imageUrl?: string;
  imagePublicId?: string; // Add for Cloudinary
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
