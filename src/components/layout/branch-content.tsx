"use client";

import { Store } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Branch } from "@/interfaces/branch.interface";

interface BranchContentProps {
  children: React.ReactNode;
  branch: Branch;
}

export function BranchContent({ children, branch }: BranchContentProps) {
  return (
    <SidebarInset className="flex-1">
      {/* Mobile header */}
      <div className="lg:hidden h-16 flex items-center px-4 border-b bg-background">
        <div className="w-6 mr-6"></div>
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <span className="font-medium">{branch.name}</span>
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">{children}</div>
      </main>
    </SidebarInset>
  );
}
