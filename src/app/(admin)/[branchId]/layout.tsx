"use client";

import { BranchLayout } from "@/components/layout/branch-layout";
import { useParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function BranchPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ใช้ useParams hook แทนการรับ params จาก props
  const params = useParams();
  const branchId = params.branchId as string;

  // สำหรับ client component ไม่สามารถใช้ cookies().get ได้โดยตรง
  // จึงต้องตรวจสอบใน localStorage หรือใช้ค่า default แทน
  const isSidebarCollapsed = branchId.includes("kitchen"); // ตัวอย่างการตรวจสอบหน้า kitchen
  
  // ใช้ defaultOpen (boolean) แทน defaultState (string)
  const defaultOpen = !isSidebarCollapsed;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <BranchLayout branchId={branchId}>{children}</BranchLayout>
    </SidebarProvider>
  );
}