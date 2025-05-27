"use client";

import { useEffect, useState } from "react";
import {
  DashboardStatItem,
  HourlySalesItem,
  MenuPopularityItem,
  WeeklySalesItem,
} from "@/interfaces/dashboard.interface";
import { dashboardService } from "@/services/dashboard.service";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardChart } from "./dashboard-chart";
import { OverviewChart } from "./charts/overview-chart";
import { SalesChart } from "./charts/sales-chart";
import { MenuChart } from "./charts/menu-chart";
import { HourlyChart } from "./charts/hourly-chart";
import { Branch } from "@/interfaces/branch.interface";

interface DashboardContentProps {
  branchCode: string; // The URL-friendly code (e.g., "hatyai")
  branchId?: string; // The MongoDB _id (optional if not available yet)
  branch?: Branch | null; // The full branch object (optional)
}

export function DashboardDisplay({ branchId }: DashboardContentProps) {
  console.log("[Dashboard] branchId:", branchId);
  const [activeTab, setActiveTab] = useState("overview");
  console.log("activeTab", activeTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStatItem[]>([]);
  const [salesData, setSalesData] = useState<WeeklySalesItem[]>([]);
  console.log("salesData", salesData);

  const [menuData, setMenuData] = useState<MenuPopularityItem[]>([]);
  console.log("menuData", menuData);
  const [hourlyData, setHourlyData] = useState<HourlySalesItem[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!branchId) {
        setError("ไม่พบรหัสสาขา กรุณาลองอีกครั้ง");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getAllDashboardData(branchId);
        setStats(data.stats);
        setSalesData(data.salesData);
        setMenuData(data.menuData);
        setHourlyData(data.hourlyData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [branchId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>กำลังโหลดข้อมูลแดชบอร์ด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h1>
          <p className="text-muted-foreground">
            ภาพรวมและรายงานของร้านน้ำเต้าหู้พัทลุง
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <StatIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs
          defaultValue="overview"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="sales">ยอดขาย</TabsTrigger>
            <TabsTrigger value="menu">เมนูยอดนิยม</TabsTrigger>
            <TabsTrigger value="hourly">ยอดขายรายชั่วโมง</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardChart
              title="ยอดขายประจำสัปดาห์"
              description="ยอดขายรวมของร้านในแต่ละวันของสัปดาห์นี้"
              chart={<OverviewChart data={salesData} />}
            />
          </TabsContent>

          <TabsContent value="sales">
            <DashboardChart
              title="ยอดขายประจำสัปดาห์"
              description="ยอดขายรวมของร้านในแต่ละวันของสัปดาห์นี้"
              chart={<SalesChart data={salesData} />}
            />
          </TabsContent>

          <TabsContent value="menu">
            <DashboardChart
              title="เมนูยอดนิยม"
              description="สัดส่วนการสั่งเมนูต่างๆ ในร้าน"
              chart={<MenuChart data={menuData} />}
            />
          </TabsContent>

          <TabsContent value="hourly">
            <DashboardChart
              title="ยอดขายรายชั่วโมง"
              description="ยอดขายและจำนวนลูกค้าตามช่วงเวลา"
              chart={<HourlyChart data={hourlyData} />}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
