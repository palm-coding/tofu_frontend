"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { WeeklySalesItem } from "@/interfaces/dashboard.interface";

export function OverviewChart({ data }: { data: WeeklySalesItem[] }) {
  // แปลงข้อมูลให้เหมาะกับการแสดงผล
  // ใช้ dayName แทน name และ totalSales แทน sales
  const chartData = data.map((item) => ({
    name: item.dayName,
    sales: item.totalSales,
    count: item.count,
  }));

  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#F5BF0F", // Yellow
        },
        count: {
          label: "จำนวนออร์เดอร์",
          color: "#3B82F6", // Blue
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
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fill: "#6B7280" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `฿${value}`}
          tick={{ fill: "#6B7280" }}
        />
        <ChartTooltip
          cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
          content={<ChartTooltipContent />}
          formatter={(value, name) => [
            name === "sales" ? `฿${value}` : `${value} ออร์เดอร์`,
            name === "sales" ? "ยอดขาย" : "จำนวนออร์เดอร์",
          ]}
        />
        <Bar dataKey="sales" fill="#F5BF0F" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
