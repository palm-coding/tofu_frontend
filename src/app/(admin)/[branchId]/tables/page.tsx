"use client";

import { TableDisplay } from "@/components/admin/table/table-page";
import { useParams } from "next/navigation";

export default function TablesPage() {
  const params = useParams();
  const branchId = params.branchId as string;

  return <TableDisplay branchId={branchId} />;
}
