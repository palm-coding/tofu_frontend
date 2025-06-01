"use client";

import { BranchLayout } from "@/components/layout/branch-layout";
import { useParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BranchProvider } from "@/context/branch-context";
import { AuthProvider } from "@/context/auth-context";

export default function BranchPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const branchCode = params.branchId as string;
  const defaultOpen = !branchCode.includes("kitchen");

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AuthProvider>
        <BranchProvider branchCode={branchCode}>
          <BranchLayout>{children}</BranchLayout>
        </BranchProvider>
      </AuthProvider>
    </SidebarProvider>
  );
}
