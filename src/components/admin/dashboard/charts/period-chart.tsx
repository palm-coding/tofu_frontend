"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { SalesByPeriodItem } from "@/interfaces/dashboard.interface";

export function PeriodChart({ data }: { data: SalesByPeriodItem[] }) {
  // แปลงข้อมูลให้เหมาะกับการแสดงผล
  const chartData = data.map((item) => ({
    period: item?.period || "ไม่ระบุ",
    sales: item?.totalSales || 0,
    orders: item?.orderCount || 0,
    customers: item?.customerCount || 0,
    avg: item?.averageOrderValue || 0,
  }));

  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#2563EB", // Blue
        },
        customers: {
          label: "จำนวนลูกค้า (คน)",
          color: "#10B981", // Green
        },
        orders: {
          label: "จำนวนออร์เดอร์",
          color: "#F59E0B", // Amber
        },
      }}
      className="h-full w-full"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} stroke="#E5E7EB" />
        <XAxis
          dataKey="period"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fill: "#6B7280" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}`}
          tick={{ fill: "#6B7280" }}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
          content={<ChartTooltipContent />}
          formatter={(value, name) => {
            if (name === "sales") return [`฿${value}`, "ยอดขาย"];
            if (name === "orders") return [`${value} รายการ`, "จำนวนออร์เดอร์"];
            if (name === "customers") return [`${value} คน`, "จำนวนลูกค้า"];
            if (name === "avg") return [`฿${value}`, "ค่าเฉลี่ยต่อออร์เดอร์"];
            return [value, name];
          }}
        />
        <Bar dataKey="sales" fill="#2563EB" radius={[4, 4, 0, 0]} />
        <Bar dataKey="orders" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        <Bar dataKey="customers" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}