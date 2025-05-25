"use client";

import { KitchenDisplay } from "@/components/admin/kitchen/kitchen-page";
import { useParams } from "next/navigation";

export default function KitchenPage() {
  const params = useParams();
  const branchId = params.branchId as string;

  return <KitchenDisplay branchId={branchId} />;
}
