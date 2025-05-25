"use client";

import { MenuDisplay } from "@/components/admin/menu/menu-page";
import { useParams } from "next/navigation";

export default function MenuPage() {
  const params = useParams();
  const branchId = params.branchId as string;

  return <MenuDisplay branchId={branchId} />;
}