"use client";

import { useEffect, useState } from "react";
import {
  DashboardStatItem,
  HourlySalesItem,
  MenuPopularityItem,
  WeeklySalesItem,
  SalesByPeriodItem,
} from "@/interfaces/dashboard.interface";
import { orderService } from "@/services/order/order.service";
import {
  Loader2,
  Users,
  ShoppingCart,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardChart } from "./dashboard-chart";
import { OverviewChart } from "./charts/overview-chart";
import { SalesChart } from "./charts/sales-chart";
import { MenuChart } from "./charts/menu-chart";
import { HourlyChart } from "./charts/hourly-chart";
import { PeriodChart } from "./charts/period-chart";
import { Branch } from "@/interfaces/branch.interface";

// สีสำหรับกราฟวงกลม
const CHART_COLORS = [
  "#3B82F6", // สีน้ำเงิน
  "#10B981", // สีเขียว
  "#F59E0B", // สีส้มเหลือง
  "#EF4444", // สีแดง
  "#8B5CF6", // สีม่วง
  "#EC4899", // สีชมพู
  "#14B8A6", // สีเขียวน้ำทะเล
  "#F97316", // สีส้ม
  "#6366F1", // สีน้ำเงินม่วง
  "#D946EF", // สีม่วงชมพู
];

interface DashboardContentProps {
  branchCode: string;
  branchId?: string;
  branch?: Branch | null;
}

export function DashboardDisplay({ branchId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  console.log("activeTab:", activeTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStatItem[]>([]);
  const [weeklySalesData, setWeeklySalesData] = useState<WeeklySalesItem[]>([]);
  const [menuData, setMenuData] = useState<MenuPopularityItem[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlySalesItem[]>([]);
  const [salesByPeriodData, setSalesByPeriodData] = useState<
    SalesByPeriodItem[]
  >([]);

  // วันนี้
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];

  // 7 วันย้อนหลัง
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const formattedLastWeek = lastWeek.toISOString().split("T")[0];

  useEffect(() => {
    async function fetchDashboardData() {
      if (!branchId) {
        setError("ไม่พบรหัสสาขา กรุณาลองอีกครั้ง");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ดึงข้อมูลพร้อมกันทั้งหมด
        const [
          weeklySalesResponse,
          popularMenuResponse,
          hourlySalesResponse,
          salesByPeriodResponse,
        ] = await Promise.all([
          orderService.getWeeklySales(
            branchId,
            formattedLastWeek,
            formattedToday
          ),
          orderService.getPopularMenuItems(branchId, 10),
          orderService.getHourlySales(branchId, formattedToday),
          orderService.getSalesByTimePeriod(
            branchId,
            formattedLastWeek,
            formattedToday,
            "day"
          ),
        ]);

        // แก้ไขตรงนี้: เข้าถึงข้อมูลโดยตรงจาก response เนื่องจาก orderService ได้ return response.data แล้ว
        const weeklySalesData = Array.isArray(weeklySalesResponse)
          ? weeklySalesResponse
          : [];

        const menuData = Array.isArray(popularMenuResponse)
          ? popularMenuResponse
          : [];

        const hourlyData = Array.isArray(hourlySalesResponse)
          ? hourlySalesResponse
          : [];

        const salesByPeriodData = Array.isArray(salesByPeriodResponse)
          ? salesByPeriodResponse
          : [];

        // จัดการข้อมูลสถิติ Dashboard
        prepareStatistics(weeklySalesData, salesByPeriodData);

        // เพิ่มสีให้กับข้อมูลเมนูยอดนิยม
        const menuDataWithColors =
          menuData.length > 0
            ? menuData.map((item, index) => ({
                ...item,
                // ใช้ name จาก API แทนที่จะใช้ menuItemId
                menuName:
                  item.name ||
                  (item.menuItemId
                    ? `เมนู ${item.menuItemId.substring(0, 6)}...`
                    : "ไม่ระบุ"),
                color: CHART_COLORS[index % CHART_COLORS.length],
              }))
            : [];

        // อัปเดต State
        setWeeklySalesData(weeklySalesData);
        setMenuData(menuDataWithColors);
        setHourlyData(hourlyData);
        setSalesByPeriodData(salesByPeriodData);

        console.log("Weekly Sales Data (หลังแก้ไข):", weeklySalesData);
        console.log("Popular Menu Data (หลังแก้ไข):", menuDataWithColors);
        console.log("Hourly Sales Data (หลังแก้ไข):", hourlyData);
        console.log("Sales By Period Data (หลังแก้ไข):", salesByPeriodData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [branchId, formattedLastWeek, formattedToday]);

  // สร้างข้อมูลสถิติจากข้อมูลที่ได้รับ
  function prepareStatistics(
    weeklySalesData: WeeklySalesItem[],
    salesByPeriodData: SalesByPeriodItem[]
  ) {
    // คำนวณยอดขายรวม
    const totalSales = salesByPeriodData.reduce(
      (sum, item) => sum + item.totalSales,
      0
    );

    // คำนวณจำนวนออร์เดอร์รวม
    const totalOrders = salesByPeriodData.reduce(
      (sum, item) => sum + item.orderCount,
      0
    );

    // คำนวณจำนวนลูกค้ารวม
    const totalCustomers = salesByPeriodData.reduce(
      (sum, item) => sum + item.customerCount,
      0
    );

    // คำนวณมูลค่าออร์เดอร์เฉลี่ย
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // สร้างข้อมูลสถิติ
    const statsData: DashboardStatItem[] = [
      {
        name: "ยอดขายรวม",
        value: `฿${totalSales.toLocaleString()}`,
        description: `ในช่วง ${salesByPeriodData.length} วันที่ผ่านมา`,
        icon: TrendingUp,
      },
      {
        name: "จำนวนออร์เดอร์",
        value: totalOrders.toString(),
        description: "ออร์เดอร์ทั้งหมด",
        icon: ShoppingCart,
      },
      {
        name: "จำนวนลูกค้า",
        value: totalCustomers.toString(),
        description: "ลูกค้าที่มาใช้บริการ",
        icon: Users,
      },
      {
        name: "มูลค่าออร์เดอร์เฉลี่ย",
        value: `฿${avgOrderValue.toFixed(2)}`,
        description: "ต่อออร์เดอร์",
        icon: CreditCard,
      },
    ];

    setStats(statsData);
  }

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
            ภาพรวมและรายงานของร้านน้ำเต้าหู้
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Card key={index}>
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
            <TabsTrigger value="period">ยอดขายตามช่วงเวลา</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardChart
              title="ยอดขายประจำสัปดาห์"
              description="ยอดขายรวมของร้านในแต่ละวันของสัปดาห์นี้"
              chart={<OverviewChart data={weeklySalesData} />}
            />
          </TabsContent>

          <TabsContent value="sales">
            <DashboardChart
              title="ยอดขายประจำสัปดาห์"
              description="ยอดขายรวมของร้านในแต่ละวันของสัปดาห์นี้"
              chart={<SalesChart data={weeklySalesData} />}
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

          <TabsContent value="period">
            <DashboardChart
              title="ยอดขายตามช่วงเวลา"
              description="ยอดขาย จำนวนออร์เดอร์ และลูกค้าในแต่ละช่วงเวลา"
              chart={<PeriodChart data={salesByPeriodData} />}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
