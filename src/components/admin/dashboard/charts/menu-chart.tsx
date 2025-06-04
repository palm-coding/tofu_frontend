"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { MenuPopularityItem } from "@/interfaces/dashboard.interface";

export function MenuChart({ data }: { data: MenuPopularityItem[] }) {
  // แปลงข้อมูลให้เหมาะกับการแสดงผล
  const chartData = data.map((item) => ({
    // ใช้ name หรือ menuName แทนที่จะใช้ menuItemId
    name:
      item.menuName ||
      item.name ||
      (item.menuItemId
        ? `เมนู ${item.menuItemId?.substring(0, 6)}...`
        : "ไม่ระบุ"),
    value: item.totalCount || 0,
    percentage: item.percentage || 0,
    price: item.price || 0,
    color: item.color || "#CCCCCC",
  }));

  // สร้าง chart config จากข้อมูล
  const chartConfig = chartData.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.color,
    };
    return config;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[400px] w-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
          formatter={(value, name, entry) => {
            // แก้ไขการเข้าถึง index โดยใช้ dataKey และ payload
            if (!entry || !entry.payload) {
              return ["ไม่มีข้อมูล", ""];
            }

            // หาข้อมูลที่ตรงกับค่าปัจจุบัน
            const matchingData = chartData.find(
              (item) => item.value === value && item.name === entry.payload.name
            );
            if (!matchingData) {
              return ["ไม่มีข้อมูล", ""];
            }

            return [
              `${value} รายการ (${matchingData.percentage.toFixed(1)}%) - ฿${
                matchingData.price
              }`,
              matchingData.name,
            ];
          }}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={120}
          label={({ name, percent }) =>
            `${name} (${(percent * 100).toFixed(0)}%)`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
