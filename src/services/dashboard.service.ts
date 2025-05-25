// import axios from "axios";
import { Coffee, DollarSign, ShoppingCart, Users } from "lucide-react";
import {
  DashboardDataResponse,
  DashboardStatItem,
  DashboardStatsResponse,
  HourlySalesItem,
  HourlySalesResponse,
  MenuPopularityItem,
  MenuPopularityResponse,
  WeeklySalesItem,
  WeeklySalesResponse,
} from "@/interfaces/dashboard.interface";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true, // สำคัญมาก! ช่วยให้ส่ง cookies ได้
// });

// Mock data for dashboard stats
const mockStats: DashboardStatItem[] = [
  {
    name: "รายได้วันนี้",
    value: "฿8,250",
    description: "+15% จากเมื่อวาน",
    change: 15,
    icon: DollarSign,
  },
  {
    name: "ออร์เดอร์วันนี้",
    value: "42",
    description: "+5% จากเมื่อวาน",
    change: 5,
    icon: ShoppingCart,
  },
  {
    name: "ลูกค้าวันนี้",
    value: "35",
    description: "+12% จากเมื่อวาน",
    change: 12,
    icon: Users,
  },
  {
    name: "โต๊ะที่ใช้งาน",
    value: "8/12",
    description: "66% ของโต๊ะทั้งหมด",
    icon: Coffee,
  },
];

// Mock data for weekly sales
const mockSalesData: WeeklySalesItem[] = [
  { name: "จันทร์", sales: 4000 },
  { name: "อังคาร", sales: 3000 },
  { name: "พุธ", sales: 5000 },
  { name: "พฤหัสบดี", sales: 2780 },
  { name: "ศุกร์", sales: 7890 },
  { name: "เสาร์", sales: 9490 },
  { name: "อาทิตย์", sales: 6490 },
];

// Mock data for popular menu items
const mockMenuData: MenuPopularityItem[] = [
  { name: "น้ำเต้าหู้ร้อน", value: 35, color: "#FF8042" },
  { name: "น้ำเต้าหู้เย็น", value: 25, color: "#00C49F" },
  { name: "น้ำเต้าหู้ปั่น", value: 15, color: "#FFBB28" },
  { name: "ปาท่องโก๋", value: 20, color: "#0088FE" },
  { name: "อื่นๆ", value: 5, color: "#FF6B6B" },
];

// Mock data for hourly sales
const mockHourlyData: HourlySalesItem[] = [
  { time: "08:00", customers: 5, sales: 500 },
  { time: "09:00", customers: 10, sales: 1200 },
  { time: "10:00", customers: 15, sales: 1800 },
  { time: "11:00", customers: 20, sales: 2500 },
  { time: "12:00", customers: 25, sales: 3000 },
  { time: "13:00", customers: 20, sales: 2400 },
  { time: "14:00", customers: 15, sales: 1800 },
  { time: "15:00", customers: 10, sales: 1200 },
  { time: "16:00", customers: 12, sales: 1500 },
  { time: "17:00", customers: 15, sales: 1800 },
  { time: "18:00", customers: 18, sales: 2200 },
  { time: "19:00", customers: 12, sales: 1500 },
];

export const dashboardService = {
  // Get dashboard stats (revenue, orders, customers, tables)
  getDashboardStats: async (
    branchId: string
  ): Promise<DashboardStatsResponse> => {
    try {
      // In a real app, we would call the API:
      // const response = await api.get(`/branches/${branchId}/dashboard/stats`);
      // return response.data;

      // For now, simulate API call with mock data
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ stats: mockStats });
        }, 500); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw error;
    }
  },

  // Get weekly sales data
  getWeeklySales: async (branchId: string): Promise<WeeklySalesResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/dashboard/weekly-sales`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ salesData: mockSalesData });
        }, 700); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch weekly sales:", error);
      throw error;
    }
  },

  // Get popular menu items
  getMenuPopularity: async (
    branchId: string
  ): Promise<MenuPopularityResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/dashboard/menu-popularity`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ menuData: mockMenuData });
        }, 600); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch menu popularity:", error);
      throw error;
    }
  },

  // Get hourly sales and customer data
  getHourlySales: async (branchId: string): Promise<HourlySalesResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/dashboard/hourly-sales`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ hourlyData: mockHourlyData });
        }, 800); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch hourly sales:", error);
      throw error;
    }
  },

  // Get all dashboard data in one call
  getAllDashboardData: async (
    branchId: string
  ): Promise<DashboardDataResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/dashboard/all`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            stats: mockStats,
            salesData: mockSalesData,
            menuData: mockMenuData,
            hourlyData: mockHourlyData,
          });
        }, 1000); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      throw error;
    }
  },
};
