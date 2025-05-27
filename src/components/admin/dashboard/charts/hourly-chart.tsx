"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { HourlySalesItem } from "@/interfaces/dashboard.interface";

export function HourlyChart({ data }: { data: HourlySalesItem[] }) {
  return (
    <ChartContainer
      config={{
        sales: {
          label: "ยอดขาย (บาท)",
          color: "#F59E0B", // Amber
        },
        customers: {
          label: "จำนวนลูกค้า (คน)",
          color: "#8B5CF6", // Violet
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
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "#6B7280" }}
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
          tickFormatter={(value) => `${value} คน`}
          tick={{ fill: "#8B5CF6" }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
          formatter={(value, name) => [
            name === "sales" ? `฿${value}` : `${value} คน`,
            name === "sales" ? "ยอดขาย" : "จำนวนลูกค้า",
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
        />
      </LineChart>
    </ChartContainer>
  );
}
