export type OrderStatus =
  | "received"
  | "pending"
  | "preparing"
  | "served"
  | "paid";

export interface OrderLine {
  menuItemId:
    | string
    | {
        _id: string;
        name: string;
        price: number;
        description?: string;
        imageUrl?: string;
        [key: string]: string | number | boolean | undefined; // รองรับ property อื่นๆ ที่อาจมี
      };
  qty?: number;
  quantity?: number;
  note?: string;
  status?: OrderStatus;
}

export interface Table {
  _id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: "available" | "occupied";
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  branchId: string;
  sessionId: string;
  tableId: Table;
  // เพิ่มฟิลด์ใหม่เพื่อรองรับการสั่งอาหารแยกตามลูกค้า
  clientId: string;
  orderBy: string;
  status: OrderStatus;
  orderLines: OrderLine[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  order: Order;
}

// เพิ่ม interface สำหรับ request ในการสร้าง order
export interface CreateOrderRequest {
  sessionId: string;
  branchId: string;
  tableId: string;
  clientId: string;
  orderBy: string;
  orderLines: OrderLine[];
  totalAmount: number;
}
