"use client";

import { DashboardDisplay } from "@/components/admin/dashboard/dashboard-page";
import { useBranch } from "@/context/branch-context";

export default function BranchDashboardPage() {
  // ใช้ข้อมูลจาก context แทนการเรียก API ซ้ำ
  const { branch, branchCode, loading } = useBranch();

  if (loading) {
    return <div className="p-4">กำลังโหลด...</div>;
  }

  // Pass both code and ID to the component
  return (
    <DashboardDisplay
      branchCode={branchCode}
      branchId={branch?._id}
      branch={branch}
    />
  );
}
