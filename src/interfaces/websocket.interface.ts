import { Order } from "./order.interface";

export interface SocketResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  room?: string;
}

export interface NewOrderEvent {
  order: Order;
}

export interface OrderStatusChangedEvent {
  order: Order;
}

// สามารถเพิ่ม export EventMap ได้ถ้าต้องการนำไปใช้ในไฟล์อื่น
export interface EventMap {
  newOrder: Order;
  orderStatusChanged: Order;
  connect: void;
  disconnect: void;
  connect_error: Error;
  [key: string]: unknown;
}
