export interface Branch {
  id: string;
  name: string;
  address: string;
  contact: string;
  active?: boolean;
  managerId?: string;
  createdAt?: string;
  updatedAt?: string;
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
