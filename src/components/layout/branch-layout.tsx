"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BranchSidebar } from "./branch-sidebar";
import { BranchMobileMenu } from "./branch-mobile-menu";
import { BranchContent } from "./branch-content";
import { BranchFooter } from "./branch-footer";
import { Branch } from "@/interfaces/branch.interface";
import { User } from "@/interfaces/user.interface";

interface BranchLayoutProps {
  children: React.ReactNode;
  branchId: string;
}

// Mock branches data
const mockBranches: Branch[] = [
  {
    id: "branch1",
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
  const [user, setUser] = useState<User | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setUser(parsedUser);

    // Check if user has access to this branch
    if (
      parsedUser.role === "branch_owner" &&
      parsedUser.branchId !== branchId
    ) {
      router.push(`/${parsedUser.branchId}`);
      return;
    }

    // Find branch details
    const branchDetails = mockBranches.find((b) => b.id === branchId);
    if (branchDetails) {
      setBranch(branchDetails);
    }
  }, [branchId, router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user || !branch || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400"></p>
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
