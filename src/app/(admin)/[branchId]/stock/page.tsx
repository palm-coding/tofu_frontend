"use client";

import { StockDisplay } from "@/components/admin/stock/stock-page";
import { useBranch } from "@/context/branch-context";

export default function StockPage() {
  const { branch, branchCode, loading } = useBranch();

  if (loading) {
    return <div className="p-4">กำลังโหลด...</div>;
  }

  return (
    <StockDisplay
      branchCode={branchCode}
      branchId={branch?._id}
      branch={branch}
    />
  );
}
