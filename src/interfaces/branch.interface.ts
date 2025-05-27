export interface Branch {
  _id: string; // เปลี่ยนเป็นบังคับ แทนที่จะเป็น optional
  name: string;
  code: string; // เพิ่ม code ตามข้อมูลจริง
  address: string;
  contact: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number; // เพิ่มเพื่อรองรับ MongoDB version key
}

export interface BranchListResponse {
  branches: Branch[];
  total: number;
}

export interface BranchDetailResponse {
  branch: Branch;
}

export interface CreateBranchDto {
  name: string;
  address: string;
  contact: string;
  active?: boolean;
  managerId?: string;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  contact?: string;
  active?: boolean;
  managerId?: string;
}
