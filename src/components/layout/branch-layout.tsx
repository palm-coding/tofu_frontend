"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BranchSidebar } from "./branch-sidebar";
import { BranchMobileMenu } from "./branch-mobile-menu";
import { BranchContent } from "./branch-content";
import { BranchFooter } from "./branch-footer";
import { useAuth } from "@/context/auth-context";
import { useBranch } from "@/context/branch-context";

interface BranchLayoutProps {
  children: React.ReactNode;
}

export function BranchLayout({ children }: BranchLayoutProps) {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { branch, loading: branchLoading, error } = useBranch();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create a separate effect for the authorization check
  useEffect(() => {
    // ตรวจสอบสิทธิ์การเข้าถึง
    if (
      user &&
      user.role === "branch_owner" &&
      branch &&
      user.branchId !== branch._id
    ) {
      // ถ้าเป็นเจ้าของสาขาแต่พยายามเข้าถึงสาขาอื่น ให้ redirect ไปยังสาขาของตัวเอง
      router.push(`/${user.branchId}`);
      return;
    }
  }, [user, branch, router]);

  const handleLogout = async () => {
    await logout();
  };

  // กำลังโหลดข้อมูล
  if (authLoading || branchLoading || !mounted) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
          <div className="relative w-16 h-16">
          </div>
        </div>
      </div>
    );
  }

  // ไม่พบข้อมูลสาขา
  if (!branch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <p className="text-muted-foreground">
            {error || "ไม่พบข้อมูลสาขาที่ต้องการ"}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            onClick={() => router.push("/branches")}
          >
            กลับไปยังหน้าสาขา
          </button>
        </div>
      </div>
    );
  }

  // ไม่มีข้อมูลผู้ใช้
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
          branchId={branch._id}
          branch={branch}
          user={user}
          handleLogout={handleLogout}
        />

        {/* Mobile menu */}
        <BranchMobileMenu
          branch={branch}
          user={user}
          branchId={branch._id}
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
