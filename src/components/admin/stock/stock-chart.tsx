"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  BarChart3,
} from "lucide-react";
import type { Stock } from "@/interfaces/stock.interface";

interface StockChartsProps {
  stocks: Stock[];
}
interface TooltipEntry {
  color: string;
  dataKey: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export function StockCharts({ stocks }: StockChartsProps) {
  // Prepare data for charts
  const chartData = stocks.map((stock) => {
    const ingredient =
      typeof stock.ingredientId === "object"
        ? stock.ingredientId
        : { name: `Ingredient ${stock.ingredientId}`, unit: "units" };

    const status =
      stock.quantity <= stock.lowThreshold
        ? "ใกล้หมด"
        : stock.quantity <= stock.lowThreshold * 1.5
        ? "ต่ำ"
        : "ปกติ";

    return {
      name: ingredient?.name || "Unknown",
      quantity: stock.quantity,
      threshold: stock.lowThreshold,
      unit: ingredient?.unit || "units",
      status,
      utilization: Math.round(
        (stock.quantity / (stock.lowThreshold * 2)) * 100
      ),
      difference: stock.quantity - stock.lowThreshold,
    };
  });

  // Status distribution data
  const statusData = [
    {
      name: "ปกติ",
      value: stocks.filter((s) => s.quantity > s.lowThreshold * 1.5).length,
      color: "#22c55e",
    },
    {
      name: "ต่ำ",
      value: stocks.filter(
        (s) => s.quantity > s.lowThreshold && s.quantity <= s.lowThreshold * 1.5
      ).length,
      color: "#eab308",
    },
    {
      name: "ใกล้หมด",
      value: stocks.filter((s) => s.quantity <= s.lowThreshold).length,
      color: "#ef4444",
    },
  ];

  // Summary statistics
  const totalItems = stocks.length;
  const lowStockItems = stocks.filter(
    (s) => s.quantity <= s.lowThreshold
  ).length;
  const criticalPercentage =
    totalItems > 0 ? Math.round((lowStockItems / totalItems) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: TooltipEntry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === "quantity" ? "คงเหลือ" : "เกณฑ์ต่ำสุด"}:{" "}
              {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">รวมทั้งหมด</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ใกล้หมด</p>
                <p className="text-2xl font-bold text-destructive">
                  {lowStockItems}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  เปอร์เซ็นต์วิกฤต
                </p>
                <p className="text-2xl font-bold">{criticalPercentage}%</p>
              </div>
              {criticalPercentage > 20 ? (
                <TrendingDown className="h-8 w-8 text-destructive" />
              ) : (
                <TrendingUp className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">สถานะรวม</p>
                <Badge
                  variant={
                    criticalPercentage > 20 ? "destructive" : "secondary"
                  }
                  className="mt-1"
                >
                  {criticalPercentage > 20 ? "ต้องระวัง" : "ปกติ"}
                </Badge>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="bar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bar">แผนภูมิแท่ง</TabsTrigger>
          <TabsTrigger value="comparison">เปรียบเทียบ</TabsTrigger>
          <TabsTrigger value="pie">สัดส่วนสถานะ</TabsTrigger>
          <TabsTrigger value="area">แผนภูมิพื้นที่</TabsTrigger>
        </TabsList>

        <TabsContent value="bar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ปริมาณสต็อกแต่ละรายการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="quantity" fill="#3b82f6" name="คงเหลือ" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                เปรียบเทียบสต็อกกับเกณฑ์ต่ำสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="quantity" fill="#3b82f6" name="คงเหลือ" />
                    <Line
                      type="monotone"
                      dataKey="threshold"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="เกณฑ์ต่ำสุด"
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                สัดส่วนสถานะสต็อก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="area" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ระดับการใช้งานสต็อก
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />

                    <Area
                      type="monotone"
                      dataKey="utilization"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="utilization"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Critical Items Alert */}
      {lowStockItems > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              รายการที่ต้องเติมสต็อกด่วน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stocks
                .filter((stock) => stock.quantity <= stock.lowThreshold)
                .map((stock, index) => {
                  const ingredient =
                    typeof stock.ingredientId === "object"
                      ? stock.ingredientId
                      : {
                          name: `Ingredient ${stock.ingredientId}`,
                          unit: "units",
                        };

                  return (
                    <div
                      key={stock._id || index}
                      className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                    >
                      <div>
                        <p className="font-medium">{ingredient?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          เหลือ {stock.quantity} {ingredient?.unit}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        ใกล้หมด
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
