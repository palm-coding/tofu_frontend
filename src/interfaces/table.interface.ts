export type TableStatus = "available" | "occupied";

export interface Table {
  _id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: TableStatus;
  createdAt: string;
  updatedAt: string;
}

// Combined interface for UI display (joining table and session data)
export interface TableDisplay {
  _id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: TableStatus;
  createdAt: string;
  updatedAt: string;
  // Session-related data
  sessionId?: string;
  checkinTime?: string;
  customerName?: string;
  orders?: {
    _id: string;
    status: string;
    createdAt: string;
    orderLines: import("./order.interface").OrderLine[];
    totalAmount: number;
  }[];
}

export interface TableListResponse {
  tables: TableDisplay[];
}

export interface TableResponse {
  table: TableDisplay;
}
