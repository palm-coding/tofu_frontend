"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BranchSidebar } from "./branch-sidebar";
import { BranchMobileMenu } from "./branch-mobile-menu";
import { BranchContent } from "./branch-content";
import { BranchFooter } from "./branch-footer";
import { Branch } from "@/interfaces/branch.interface";
import { useAuth } from "@/hooks/useAuth";

interface BranchLayoutProps {
  children: React.ReactNode;
  branchId: string;
}

// Mock branches data
const mockBranches: Branch[] = [
  {
    id: "683324ddf7a518cd81e53da2",
    name: "สาขาตลาดเมืองใหม่",
    address: "ตลาดเมืองใหม่",
    contact: "074-123456",
  },
  {
    id: "branch2",
    name: "สาขาตลาดใน",
    address: "ตลาดใน",
    contact: "074-789012",
  },
  {
    id: "branch3",
    name: "สาขาหาดใหญ่",
    address: "หาดใหญ่",
    contact: "074-345678",
  },
];

export function BranchLayout({ children, branchId }: BranchLayoutProps) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Find branch details
    const branchDetails = mockBranches.find((b) => b.id === branchId);
    if (branchDetails) {
      setBranch(branchDetails);
    }

    // Check if user has access to this branch
    if (user && user.role === "branch_owner" && user.branchId !== branchId) {
      router.push(`/${user.branchId}`);
      return;
    }
  }, [branchId, router, user]);

  const handleLogout = async () => {
    await logout(); // ใช้ logout function จาก useAuth
    // useAuth จะจัดการ redirect ให้อัตโนมัติ
  };

  // กำลังโหลดข้อมูล หรือยังไม่พร้อมแสดงผล
  if (loading || !mounted || !branch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-muted rounded-full border-t-primary mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ไม่มีข้อมูลผู้ใช้ (ยังไม่ล็อกอิน)
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-muted rounded-full border-t-primary mb-4"></div>
          <p className="text-muted-foreground">กำลังนำทาง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <div className="flex flex-1 w-full">
        {/* Desktop Sidebar */}
        <BranchSidebar
          branchId={branchId}
          branch={branch}
          user={user}
          handleLogout={handleLogout}
        />

        {/* Mobile menu */}
        <BranchMobileMenu
          branch={branch}
          user={user}
          branchId={branchId}
          open={open}
          setOpen={setOpen}
          handleLogout={handleLogout}
        />

        {/* Main content */}
        <BranchContent branch={branch}>{children}</BranchContent>
      </div>

      {/* Footer */}
      <BranchFooter branchName={branch.name} />
    </div>
  );
}
