import { LucideIcon } from "lucide-react";

// Stat card data
export interface DashboardStatItem {
  name: string;
  value: string;
  description: string;
  icon: LucideIcon;
  change?: number;
}

// Weekly sales data จาก /orders/analytics/weekly-sales
export interface WeeklySalesItem {
  totalSales: number;
  count: number;
  day: number;
  dayName: string;
}

// Popular menu items จาก /orders/analytics/popular-menu
export interface MenuPopularityItem {
  totalCount: number;
  orders: number;
  menuItemId: string;
  name: string; // เพิ่มชื่อเมนูจริงจาก API
  price: number; // เพิ่มราคาเมนูจาก API
  menuName?: string; // เก็บไว้สำหรับการ override ชื่อเมนูถ้าจำเป็น
  percentage: number;
  color?: string; // เพิ่มเพื่อใช้กำหนดสีในกราฟ
}

// Hourly sales data จาก /orders/analytics/hourly-sales
export interface HourlySalesItem {
  hour: number;
  timeRange: string;
  totalSales: number;
  count: number;
}

// Sales by period data จาก /orders/analytics/sales-by-period
export interface SalesByPeriodItem {
  period: string;
  totalSales: number;
  orderCount: number;
  customerCount: number;
  averageOrderValue: number;
}

// Combined dashboard data
export interface DashboardDataResponse {
  stats: DashboardStatItem[];
  weeklySales: WeeklySalesItem[];
  popularMenus: MenuPopularityItem[];
  hourlySales: HourlySalesItem[];
  salesByPeriod: SalesByPeriodItem[];
}
