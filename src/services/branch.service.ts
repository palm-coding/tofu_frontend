// services/branch.service.ts
import axios from "axios";
import {
  Branch,
  CreateBranchDto,
  UpdateBranchDto,
} from "@/interfaces/branch.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const branchService = {
  // Get all branches
  getBranches: async (): Promise<Branch[]> => {
    try {
      const response = await api.get("/branches");
      return response.data; // API ส่งข้อมูลเป็น array โดยตรง
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      return []; // ส่งค่า empty array เมื่อเกิดข้อผิดพลาด
    }
  },

  // Get a single branch by ID
  getBranchById: async (_id: string): Promise<Branch | null> => {
    try {
      const response = await api.get(`/branches/${_id}`);
      return response.data; // API ส่งข้อมูล branch object โดยตรง
    } catch (error) {
      console.error(`Failed to fetch branch ${_id}:`, error);
      return null; // ส่ง null เมื่อเกิดข้อผิดพลาด
    }
  },

  // Create new branch
  createBranch: async (branchData: CreateBranchDto): Promise<Branch | null> => {
    try {
      const response = await api.post("/branches", branchData);
      return response.data;
    } catch (error) {
      console.error("Failed to create branch:", error);
      return null;
    }
  },

  // Get branch by code
  getBranchByCode: async (code: string): Promise<Branch | null> => {
    try {
      const response = await api.get(`/branches/code/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch branch by code ${code}:`, error);
      return null;
    }
  },

  // Update branch
  updateBranch: async (
    _id: string,
    branchData: UpdateBranchDto
  ): Promise<Branch | null> => {
    try {
      const response = await api.patch(`/branches/${_id}`, branchData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update branch ${_id}:`, error);
      return null;
    }
  },

  // Delete branch
  deleteBranch: async (_id: string): Promise<boolean> => {
    try {
      await api.delete(`/branches/${_id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete branch ${_id}:`, error);
      return false;
    }
  },
};
