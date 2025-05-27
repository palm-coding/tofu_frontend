"use client";

import { KitchenDisplay } from "@/components/admin/kitchen/kitchen-page";
import { useBranch } from "@/context/branch-context";

export default function KitchenPage() {
  const { branch, branchCode, loading } = useBranch();

  if (loading) {
    return <div className="p-4">กำลังโหลด...</div>;
  }

  return (
    <KitchenDisplay
      branchCode={branchCode}
      branchId={branch?._id}
      branch={branch}
    />
  );
}
