import { Order } from "./order.interface";
import { Payment } from "./payment.interface";

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

export interface PaymentStatusChangedEvent {
  payment: Payment;
  sessionId?: string;
  tableId?: string;
  orderId?: string;
}

// สามารถเพิ่ม export EventMap ได้ถ้าต้องการนำไปใช้ในไฟล์อื่น
export interface EventMap {
  newOrder: Order;
  orderStatusChanged: Order;
  paymentStatusChanged: Payment;
  connect: void;
  disconnect: void;
  connect_error: Error;
  [key: string]: unknown;
}
