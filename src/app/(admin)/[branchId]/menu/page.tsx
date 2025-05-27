"use client";

import { MenuDisplay } from "@/components/admin/menu/menu-page";
import { useBranch } from "@/context/branch-context";

export default function MenuPage() {
  const { branch, branchCode, loading } = useBranch();

  if (loading) {
    return <div className="p-4">กำลังโหลด...</div>;
  }

  return (
    <MenuDisplay
      branchCode={branchCode}
      branchId={branch?._id}
      branch={branch}
    />
  );
}
