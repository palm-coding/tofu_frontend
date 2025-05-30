export interface BranchData {
  _id: string;
  name: string;
  code: string;
  address: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TableData {
  _id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SessionMember {
  clientId: string;
  userLabel: string;
  joinedAt: string;
}

// อัปเดตโครงสร้างตาม response ใหม่จาก backend
export interface Session {
  _id: string;
  branchId: string | BranchData;
  tableId: string | TableData;
  qrCode: string;
  // เพิ่ม array ของ members แทนที่ userLabel เดิม
  members: SessionMember[];
  userLabel?: string; // ยังคงเก็บไว้สำหรับความเข้ากันได้กับโค้ดเดิม
  checkinAt: string;
  checkoutAt?: string;
  orderIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionResponse {
  _id: string;
  branchId: string | BranchData;
  tableId: string | TableData;
  qrCode: string;
  // เพิ่ม array ของ members แทนที่ userLabel เดิม
  members: SessionMember[];
  userLabel?: string; // ยังคงเก็บไว้สำหรับความเข้ากันได้กับโค้ดเดิม
  checkinAt: string;
  checkoutAt?: string;
  orderIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

// เพิ่ม interface สำหรับการสร้าง session
export interface CreateSessionRequest {
  branchId: string;
  tableId: string;
  member?: {
    clientId: string;
    userLabel: string;
  };
}

// เพิ่ม interface สำหรับการเข้าร่วม session
export interface JoinSessionRequest {
  clientId: string;
  userLabel: string;
}
