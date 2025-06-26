import { Order } from "./order.interface";
import { Payment } from "./payment.interface";
import { Table, TableStatus } from "./table.interface"; 

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

export interface TableStatusChangedEvent {
  table: Table;
  previousStatus?: TableStatus;
  newStatus: TableStatus;
  branchId: string;
  updatedAt: string;
}

export interface SessionCheckoutEvent {
  _id: string;
  branchId: string;
  tableId: string | { _id: string; [key: string]: unknown };
  qrCode: string;
  members: Array<{ clientId: string; userLabel: string; joinedAt: string }>;
  checkinAt: string;
  checkoutAt: string;
  orderIds: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// สามารถเพิ่ม export EventMap ได้ถ้าต้องการนำไปใช้ในไฟล์อื่น
export interface EventMap {
  newOrder: Order;
  orderStatusChanged: Order;
  paymentStatusChanged: Payment;
  sessionCheckout: SessionCheckoutEvent;
  tableStatusChanged: TableStatusChangedEvent;
  connect: void;
  disconnect: void;
  connect_error: Error;
  [key: string]: unknown;
}
