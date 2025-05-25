import { LucideIcon } from "lucide-react";

// Stat card data
export interface DashboardStatItem {
  name: string;
  value: string;
  description: string;
  icon: LucideIcon;
  change?: number;
}

// Weekly sales data
export interface WeeklySalesItem {
  name: string; // Day name
  sales: number;
}

// Popular menu items
export interface MenuPopularityItem {
  name: string;
  value: number;
  color: string;
}

// Hourly sales and customer data
export interface HourlySalesItem {
  time: string;
  customers: number;
  sales: number;
}

// Dashboard data response interfaces
export interface DashboardStatsResponse {
  stats: DashboardStatItem[];
}

export interface WeeklySalesResponse {
  salesData: WeeklySalesItem[];
}

export interface MenuPopularityResponse {
  menuData: MenuPopularityItem[];
}

export interface HourlySalesResponse {
  hourlyData: HourlySalesItem[];
}

// Combined dashboard data
export interface DashboardDataResponse {
  stats: DashboardStatItem[];
  salesData: WeeklySalesItem[];
  menuData: MenuPopularityItem[];
  hourlyData: HourlySalesItem[];
}
