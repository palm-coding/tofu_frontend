// Define order status types
export type OrderStatus = "pending" | "preparing" | "served";

// Order item definition
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  note: string;
  status: OrderStatus;
}

// Order definition
export interface KitchenOrder {
  id: string;
  tableId: string;
  tableName: string;
  customerName: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

// API request interfaces
export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
}

export interface UpdateOrderItemStatusRequest {
  orderId: string;
  itemId: string;
  status: OrderStatus;
}

// API response interfaces
export interface GetOrdersResponse {
  orders: KitchenOrder[];
}

export interface UpdateOrderResponse {
  order: KitchenOrder;
}

export interface OrdersFilterOptions {
  status?: OrderStatus;
  limit?: number;
  branchId: string;
}
