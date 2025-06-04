"use client";

import { useEffect, useState, useCallback } from "react";
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
  RefreshCw,
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
import { useOrdersSocket } from "@/hooks/useOrdersSocket";
import { Order } from "@/interfaces/order.interface";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  console.log("activeTab", activeTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<DashboardStatItem[]>([]);
  const [weeklySalesData, setWeeklySalesData] = useState<WeeklySalesItem[]>([]);
  const [menuData, setMenuData] = useState<MenuPopularityItem[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlySalesItem[]>([]);
  const [salesByPeriodData, setSalesByPeriodData] = useState<
    SalesByPeriodItem[]
  >([]);
  const [usePolling, setUsePolling] = useState(false);

  // วันนี้
  const today = new Date();
  today.setHours(23, 59, 59, 999); // ตั้งเป็นสิ้นสุดของวัน
  const formattedToday = today.toISOString();

  // 7 วันย้อนหลัง
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(0, 0, 0, 0); // ตั้งเป็นเริ่มต้นของวัน
  const formattedLastWeek = lastWeek.toISOString();

  // ดึงข้อมูลแดชบอร์ด
  const fetchDashboardData = useCallback(async () => {
    if (!branchId) {
      setError("ไม่พบรหัสสาขา กรุณาลองอีกครั้ง");
      return;
    }

    try {
      setRefreshing(true);
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

      // เข้าถึงข้อมูลโดยตรงจาก response เนื่องจาก orderService ได้ return response.data แล้ว
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
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [branchId, formattedLastWeek, formattedToday]);

  // จัดการออร์เดอร์ใหม่ที่ได้รับจาก WebSocket
  const handleNewOrder = useCallback(
    (newOrder: Order) => {
      console.log("Dashboard: New order received via WebSocket:", newOrder);

      // แสดง toast notification เมื่อได้รับออร์เดอร์ใหม่
      const tableName =
        typeof newOrder.tableId === "object"
          ? newOrder.tableId.name
          : "ไม่ระบุโต๊ะ";
      toast.success("มีออร์เดอร์ใหม่!", {
        description: (
          <div className="mt-1">
            <div className="font-medium">{tableName}</div>
            <div className="mt-1 space-y-1 max-h-24 overflow-auto">
              {newOrder.orderLines?.slice(0, 3).map((line, i) => {
                const menuName =
                  typeof line.menuItemId === "object"
                    ? line.menuItemId.name
                    : "รายการอาหาร";
                const qty = line.qty || line.quantity || 1;
                return (
                  <div key={i} className="text-sm">
                    • {menuName} x{qty}
                  </div>
                );
              })}
              {newOrder.orderLines && newOrder.orderLines.length > 3 && (
                <div className="text-xs text-gray-500 mt-1">
                  + อีก {newOrder.orderLines.length - 3} รายการ
                </div>
              )}
            </div>
          </div>
        ),
        duration: 10000,
      });

      // รีเฟรชข้อมูลแดชบอร์ดอัตโนมัติเมื่อได้รับออร์เดอร์ใหม่
      fetchDashboardData();
    },
    [fetchDashboardData]
  );

  // จัดการการเปลี่ยนสถานะออร์เดอร์ที่ได้รับจาก WebSocket
  const handleOrderStatusChanged = useCallback(
    (updatedOrder: Order) => {
      console.log(
        "Dashboard: Order status changed via WebSocket:",
        updatedOrder
      );

      // ถ้าสถานะเป็น paid ให้รีเฟรชข้อมูลแดชบอร์ดอัตโนมัติ
      if (updatedOrder.status === "paid") {
        toast.info("มีการชำระเงินออร์เดอร์", {
          description: (
            <div className="mt-1">
              <div className="font-medium">
                โต๊ะ:{" "}
                {typeof updatedOrder.tableId === "object"
                  ? updatedOrder.tableId.name
                  : "ไม่ระบุโต๊ะ"}
              </div>
              <div className="mt-1 py-1 px-2 bg-green-50 rounded-md border border-green-100">
                <span className="font-semibold text-green-700">
                  กำลังรีเฟรชข้อมูลแดชบอร์ด...
                </span>
              </div>
            </div>
          ),
          duration: 3000,
        });

        // รีเฟรชข้อมูลแดชบอร์ดหลังจากมีการชำระเงิน
        fetchDashboardData();
      }
    },
    [fetchDashboardData]
  );

  // จัดการข้อผิดพลาดจาก WebSocket
  const handleSocketError = useCallback((err: Error) => {
    console.error("Dashboard WebSocket error:", err);
    setUsePolling(true);
  }, []);

  // เชื่อมต่อกับ WebSocket ด้วย custom hook
  const { isConnected } = useOrdersSocket({
    branchId,
    onNewOrder: handleNewOrder,
    onOrderStatusChanged: handleOrderStatusChanged,
    onError: handleSocketError,
  });

  // โหลดข้อมูลแดชบอร์ดครั้งแรกและตั้งค่า polling ถ้าจำเป็น
  useEffect(() => {
    fetchDashboardData();

    // ใช้ polling เป็น fallback เมื่อ WebSocket ไม่ทำงาน
    let pollingInterval: NodeJS.Timeout | null = null;

    if (usePolling && branchId) {
      pollingInterval = setInterval(() => {
        console.log("Dashboard: Using polling as fallback");
        fetchDashboardData();
      }, 60000); // poll ทุก 1 นาที
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [branchId, fetchDashboardData, usePolling]);

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

  // ฟังก์ชันรีเฟรชข้อมูลด้วยตนเอง
  const handleManualRefresh = () => {
    fetchDashboardData();
  };

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
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              แดชบอร์ด
              {isConnected && (
                <span className="ml-2 text-sm font-normal text-green-500 bg-green-100 px-2 py-1 rounded-full">
                  real-time พร้อมใช้งาน
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">
              ภาพรวมและรายงานของร้านน้ำเต้าหู้
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังรีเฟรช...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                รีเฟรชข้อมูล
              </>
            )}
          </Button>
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
