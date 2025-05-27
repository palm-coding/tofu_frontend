"use client";

import { TableDisplay } from "@/components/admin/table/table-page";
import { useBranch } from "@/context/branch-context";

export default function TablesPage() {
  const { branch, branchCode, loading } = useBranch();

  if (loading) {
    return <div className="p-4">กำลังโหลด...</div>;
  }

  return (
    <TableDisplay
      branchCode={branchCode}
      branchId={branch?._id}
      branch={branch}
    />
  );
}
