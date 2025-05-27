"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { WeeklySalesItem } from "@/interfaces/dashboard.interface";

export function OverviewChart({ data }: { data: WeeklySalesItem[] }) {
  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#F5BF0F", // Blue
        },
      }}
      className="h-full w-full"
    >
      <BarChart
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
          content={<ChartTooltipContent hideLabel />}
          formatter={(value) => [`฿${value}`, "ยอดขาย"]}
        />
        <Bar dataKey="sales" fill="#F5BF0F" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
