import { LucideIcon } from "lucide-react";

// Menu and category interfaces
export interface MenuCategory {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  isAvailable?: boolean;
}

// Cart and order interfaces
export interface CartItem extends MenuItem {
  quantity: number;
  note: string;
}

export type OrderStatus = "pending" | "preparing" | "served";

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  userName: string;
}

// Session interface
export interface SessionData {
  id: string;
  branchId: string;
  tableId: string;
  tableName: string;
  branchName: string;
}

// API request interfaces
export interface SubmitOrderRequest {
  items: CartItem[];
  total: number;
  userName: string;
  sessionId: string;
}

// API response interfaces
export interface MenuCategoriesResponse {
  categories: MenuCategory[];
}

export interface MenuItemsResponse {
  items: MenuItem[];
}

export interface SessionResponse {
  session: SessionData;
}

export interface OrderHistoryResponse {
  orders: Order[];
}

export interface SubmitOrderResponse {
  order: Order;
}
