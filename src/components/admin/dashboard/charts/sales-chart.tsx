"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { WeeklySalesItem } from "@/interfaces/dashboard.interface";
import { useId } from "react";

export function SalesChart({ data }: { data: WeeklySalesItem[] }) {
  const chartId = useId();

  // เรียงข้อมูลตามวัน
  const sortedData = [...data].sort((a, b) => a.day - b.day);

  // แปลงข้อมูลให้เหมาะกับการแสดงผล
  const chartData = sortedData.map((item) => ({
    name: item.dayName,
    sales: item.totalSales,
  }));

  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#10B981",
        },
      }}
      className="h-full w-full"
    >
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        // เพิ่ม key เพื่อบังคับให้ re-render เมื่อข้อมูลเปลี่ยน
        key={`sales-chart-${chartId}`}
      >
        <CartesianGrid vertical={false} stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
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
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
          formatter={(value) => [`฿${value}`, "ยอดขาย"]}
        />
        <Line
          dataKey="sales"
          type="monotone"
          stroke="#10B981"
          strokeWidth={3}
          dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
          activeDot={{
            r: 6,
            fill: "#10B981",
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
          // เพิ่ม animation
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </LineChart>
    </ChartContainer>
  );
}
