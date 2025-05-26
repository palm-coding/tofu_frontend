// services/auth.service.ts
// import axios from "axios";
import {
  Branch,
  BranchDetailResponse,
  BranchListResponse,
} from "@/interfaces/branch.interface";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// Mock branches data
const mockBranches: Branch[] = [
  {
    id: "683324ddf7a518cd81e53da2",
    name: "สาขาตลาดเมืองใหม่",
    address: "ตลาดเมืองใหม่ อ.เมือง จ.พัทลุง",
    contact: "074-123456",
    active: true,
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-06-10T14:20:00Z",
  },
  {
    id: "branch2",
    name: "สาขาตลาดใน",
    address: "ตลาดใน อ.เมือง จ.พัทลุง",
    contact: "074-654321",
    active: true,
    createdAt: "2023-03-20T10:45:00Z",
    updatedAt: "2023-07-05T09:15:00Z",
  },
  {
    id: "branch3",
    name: "สาขาหาดใหญ่",
    address: "ตลาดกิมหยง อ.หาดใหญ่ จ.สงขลา",
    contact: "074-987654",
    active: true,
    createdAt: "2023-05-12T13:20:00Z",
    updatedAt: "2023-08-18T16:30:00Z",
  },
];

export const branchService = {
  // Get all branches with pagination
  getBranches: async (): Promise<BranchListResponse> => {
    try {
      // In a real app, we would call the API:
      // const response = await api.get('/branches');
      // return response.data;

      // For now, simulate API call with mock data
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            branches: mockBranches,
            total: mockBranches.length,
          });
        }, 500); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      throw error;
    }
  },

  // Get a single branch by ID
  getBranchById: async (id: string): Promise<BranchDetailResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/branches/${id}`);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const branch = mockBranches.find((b) => b.id === id);
          if (branch) {
            resolve({ branch });
          } else {
            reject(new Error("Branch not found"));
          }
        }, 300);
      });
    } catch (error) {
      console.error(`Failed to fetch branch ${id}:`, error);
      throw error;
    }
  },
};
