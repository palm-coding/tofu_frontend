"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { WeeklySalesItem } from "@/interfaces/dashboard.interface";
import { useId } from "react";

export function OverviewChart({ data }: { data: WeeklySalesItem[] }) {
  // สร้าง unique ID สำหรับแต่ละครั้งที่ข้อมูลเปลี่ยนแปลง
  const chartId = useId();

  // เรียงข้อมูลตามวัน
  const sortedData = [...data].sort((a, b) => a.day - b.day);

  // แปลงข้อมูลให้เหมาะกับการแสดงผล
  const chartData = sortedData.map((item) => ({
    name: item.dayName || `วัน ${item.day}`,
    sales: item.totalSales || 0,
    count: item.count || 0,
  }));

  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#F5BF0F",
        },
        count: {
          label: "จำนวนออร์เดอร์",
          color: "#3B82F6",
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
        // เพิ่ม key เพื่อบังคับให้ re-render เมื่อข้อมูลเปลี่ยน
        key={`overview-chart-${chartId}`}
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
        <Bar
          dataKey="sales"
          fill="#F5BF0F"
          radius={[4, 4, 0, 0]}
          // เพิ่ม animation
          animationDuration={800}
          animationEasing="ease-in-out"
          isAnimationActive={true}
        />
      </BarChart>
    </ChartContainer>
  );
}
