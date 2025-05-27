import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReactElement } from "react";

interface DashboardChartProps {
  title: string;
  description: string;
  chart: ReactElement;
}

export function DashboardChart({
  title,
  description,
  chart,
}: DashboardChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">{chart}</CardContent>
    </Card>
  );
}
