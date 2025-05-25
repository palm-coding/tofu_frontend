
// Table status types
export type TableStatus = "available" | "occupied";

// Order status types
export type OrderStatus = "pending" | "preparing" | "served";

// Queue status types
export type QueueStatus = "waiting" | "seated";

// Table interfaces
export interface TableItem {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
  checkinTime?: string;
  customerName?: string;
  sessionId?: string;
  orders?: Order[];
}

// Order interfaces
export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  note: string;
  status: OrderStatus;
}

// Queue interfaces
export interface QueueItem {
  id: string;
  customerName: string;
  phoneNumber: string;
  partySize: number;
  checkinTime: string;
  status: QueueStatus;
  createdAt: string;
}

// Form input interfaces
export interface NewQueueInput {
  customerName: string;
  phoneNumber: string;
  partySize: string;
  checkinTime: string;
}

// API response interfaces
export interface TableListResponse {
  tables: TableItem[];
}

export interface QueueListResponse {
  queue: QueueItem[];
}

export interface TableResponse {
  table: TableItem;
}

export interface QueueResponse {
  queueItem: QueueItem;
}
