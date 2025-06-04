"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { HourlySalesItem } from "@/interfaces/dashboard.interface";
import { useId } from "react";

export function HourlyChart({ data }: { data: HourlySalesItem[] }) {
  const chartId = useId();

  // แปลงข้อมูลให้เหมาะกับการแสดงผล
  const chartData = data.map((item) => ({
    time: item.timeRange,
    sales: item.totalSales,
    customers: item.count,
  }));

  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#F59E0B",
        },
        customers: {
          label: "จำนวนออร์เดอร์ (รายการ)",
          color: "#8B5CF6",
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
        key={`hourly-chart-${chartId}`}
      >
        <CartesianGrid vertical={false} stroke="#E5E7EB" />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "#6B7280" }}
          interval={2}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `฿${value}`}
          tick={{ fill: "#F59E0B" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value} รายการ`}
          tick={{ fill: "#8B5CF6" }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          formatter={(value, name) => [
            name === "sales" ? `฿${value}` : `${value} รายการ`,
            name === "sales" ? "ยอดขาย" : "จำนวนออร์เดอร์",
          ]}
        />
        <Line
          yAxisId="left"
          dataKey="sales"
          type="monotone"
          stroke="#F59E0B"
          strokeWidth={3}
          dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
          activeDot={{
            r: 6,
            fill: "#F59E0B",
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
          // เพิ่ม animation
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
        <Line
          yAxisId="right"
          dataKey="customers"
          type="monotone"
          stroke="#8B5CF6"
          strokeWidth={3}
          dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
          activeDot={{
            r: 6,
            fill: "#8B5CF6",
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
          // เพิ่ม animation ที่ช้ากว่าเส้นแรกเล็กน้อย
          isAnimationActive={true}
          animationBegin={200}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </LineChart>
    </ChartContainer>
  );
}
