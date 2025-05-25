"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dashboardService } from "@/services/dashboard.service";
import {
  DashboardStatItem,
  HourlySalesItem,
  MenuPopularityItem,
  WeeklySalesItem,
} from "@/interfaces/dashboard.interface";

interface DashboardContentProps {
  branchId: string;
}

export function DashboardDisplay({ branchId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview");
  console.log("activeTab:", activeTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for each data type
  const [stats, setStats] = useState<DashboardStatItem[]>([]);
  const [salesData, setSalesData] = useState<WeeklySalesItem[]>([]);
  const [menuData, setMenuData] = useState<MenuPopularityItem[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlySalesItem[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in one call
        const data = await dashboardService.getAllDashboardData(branchId);

        // Update state with the fetched data
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

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ยอดขายประจำสัปดาห์</CardTitle>
                <CardDescription>
                  ยอดขายรวมของร้านในแต่ละวันของสัปดาห์นี้
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`฿${value}`, "ยอดขาย"]} />
                    <Legend />
                    <Bar
                      dataKey="sales"
                      name="ยอดขาย (บาท)"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ยอดขายประจำสัปดาห์</CardTitle>
                <CardDescription>
                  ยอดขายรวมของร้านในแต่ละวันของสัปดาห์นี้
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`฿${value}`, "ยอดขาย"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="ยอดขาย (บาท)"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>เมนูยอดนิยม</CardTitle>
                <CardDescription>
                  สัดส่วนการสั่งเมนูต่างๆ ในร้าน
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex justify-center">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  className="max-w-md"
                >
                  <PieChart>
                    <Pie
                      data={menuData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {menuData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} รายการ`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ยอดขายรายชั่วโมง</CardTitle>
                <CardDescription>
                  ยอดขายและจำนวนลูกค้าตามช่วงเวลา
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={hourlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#3b82f6"
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "sales" ? `฿${value}` : `${value} คน`,
                        name === "sales" ? "ยอดขาย" : "จำนวนลูกค้า",
                      ]}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      name="ยอดขาย (บาท)"
                      stroke="#f59e0b"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="customers"
                      name="จำนวนลูกค้า (คน)"
                      stroke="#3b82f6"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
