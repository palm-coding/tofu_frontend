"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, DollarSign, ShoppingCart, Users } from "lucide-react";
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

interface DashboardContentProps {
  branchId: string;
}

export function DashboardDisplay({ branchId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for dashboard
  const stats = [
    {
      name: "รายได้วันนี้",
      value: "฿8,250",
      description: "+15% จากเมื่อวาน",
      icon: DollarSign,
    },
    {
      name: "ออร์เดอร์วันนี้",
      value: "42",
      description: "+5% จากเมื่อวาน",
      icon: ShoppingCart,
    },
    {
      name: "ลูกค้าวันนี้",
      value: "35",
      description: "+12% จากเมื่อวาน",
      icon: Users,
    },
    {
      name: "โต๊ะที่ใช้งาน",
      value: "8/12",
      description: "66% ของโต๊ะทั้งหมด",
      icon: Coffee,
    },
  ];

  const salesData = [
    { name: "จันทร์", sales: 4000 },
    { name: "อังคาร", sales: 3000 },
    { name: "พุธ", sales: 5000 },
    { name: "พฤหัสบดี", sales: 2780 },
    { name: "ศุกร์", sales: 7890 },
    { name: "เสาร์", sales: 9490 },
    { name: "อาทิตย์", sales: 6490 },
  ];

  const menuData = [
    { name: "น้ำเต้าหู้ร้อน", value: 35, color: "#FF8042" },
    { name: "น้ำเต้าหู้เย็น", value: 25, color: "#00C49F" },
    { name: "น้ำเต้าหู้ปั่น", value: 15, color: "#FFBB28" },
    { name: "ปาท่องโก๋", value: 20, color: "#0088FE" },
    { name: "อื่นๆ", value: 5, color: "#FF6B6B" },
  ];

  const hourlyData = [
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
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
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
