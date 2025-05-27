"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { WeeklySalesItem } from "@/interfaces/dashboard.interface";

export function SalesChart({ data }: { data: WeeklySalesItem[] }) {
  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#10B981", // Emerald
        },
      }}
      className="h-full w-full"
    >
      <LineChart
        accessibilityLayer
        data={data}
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
        />
      </LineChart>
    </ChartContainer>
  );
}
