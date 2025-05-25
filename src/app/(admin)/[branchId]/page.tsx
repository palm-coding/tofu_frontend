"use client";

import { DashboardDisplay } from "@/components/admin/dashboard/dashboard-page";
import { useParams } from "next/navigation";

export default function BranchDashboardPage() {
  // ใช้ useParams hook แทนการรับ params จาก props
  const params = useParams();
  const branchId = params.branchId as string;

  return <DashboardDisplay branchId={branchId} />;
}
