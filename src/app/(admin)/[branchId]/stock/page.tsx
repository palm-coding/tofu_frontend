"use client";

import { StockDisplay } from "@/components/admin/stock/stock-page";
import { useParams } from "next/navigation";

export default function StockPage() {
  const params = useParams();
  const branchId = params.branchId as string;

  return <StockDisplay branchId={branchId} />;
}