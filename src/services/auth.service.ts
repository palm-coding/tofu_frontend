// services/auth.service.ts
// import axios from "axios";
import {
  LoginRequest,
  LoginResponse,
  User,
  UserWithPassword,
} from "@/interfaces/user.interface";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true, // สำคัญมาก! ช่วยให้ส่ง cookies ได้
// });

// Mock user data
const mockUsers: UserWithPassword[] = [
  {
    id: "1",
    email: "admin@tofupos.com",
    password: "admin123",
    name: "Super Admin",
    role: "super_admin",
    branchId: null,
  },
  {
    id: "2",
    email: "branch1@tofupos.com",
    password: "branch123",
    name: "Branch Owner 1",
    role: "branch_owner",
    branchId: "branch1",
  },
  {
    id: "3",
    email: "branch2@tofupos.com",
    password: "branch123",
    name: "Branch Owner 2",
    role: "branch_owner",
    branchId: "branch2",
  },
];

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      // In a real app, we would call the API:
      // const response = await api.post('/auth/login', credentials);
      // return response.data;

      // For now, simulate API call with mock data
      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = mockUsers.find(
            (u) =>
              u.email === credentials.email &&
              u.password === credentials.password
          );

          if (user) {
            // Remove password before returning
            const { password, ...userWithoutPassword } = user;
            resolve({
              user: userWithoutPassword,
              token: "mock-jwt-token",
            });
          } else {
            reject(new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));
          }
        }, 500); // Simulate network delay
      });
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    // In a real app:
    // return await api.post('/auth/logout');

    // For now, just clear localStorage
    localStorage.removeItem("user");
    return Promise.resolve();
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("user");
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  },
};
