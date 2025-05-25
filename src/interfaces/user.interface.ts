export interface User {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "branch_owner" | "staff";
  branchId: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
