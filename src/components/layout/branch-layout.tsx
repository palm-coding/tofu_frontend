"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Coffee,
  CupSoda,
  LayoutDashboard,
  LogOut,
  MenuIcon,
  Package,
  ShoppingCart,
  Store,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";

interface BranchLayoutProps {
  children: React.ReactNode;
  branchId: string;
}

// Mock branches data
const mockBranches = [
  {
    id: "branch1",
    name: "สาขาตลาดเมืองใหม่",
  },
  {
    id: "branch2",
    name: "สาขาตลาดใน",
  },
  {
    id: "branch3",
    name: "สาขาหาดใหญ่",
  },
];

export function BranchLayout({ children, branchId }: BranchLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
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

  // Auto-collapse sidebar when entering kitchen page
  useEffect(() => {
    if (pathname === `/${branchId}/kitchen`) {
      setSidebarCollapsed(true);
    }
  }, [pathname, branchId]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!user || !branch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">กำลังโหลด...</p>
      </div>
    );
  }

  const navigation = [
    {
      name: "แดชบอร์ด",
      href: `/${branchId}`,
      icon: LayoutDashboard,
      current: pathname === `/${branchId}`,
    },
    {
      name: "จัดการโต๊ะ",
      href: `/${branchId}/tables`,
      icon: Coffee,
      current: pathname === `/${branchId}/tables`,
    },
    {
      name: "จัดการเมนู",
      href: `/${branchId}/menu`,
      icon: CupSoda,
      current: pathname === `/${branchId}/menu`,
    },
    {
      name: "จัดการสต็อก",
      href: `/${branchId}/stock`,
      icon: Package,
      current: pathname === `/${branchId}/stock`,
    },
    {
      name: "ห้องครัว",
      href: `/${branchId}/kitchen`,
      icon: ShoppingCart,
      current: pathname === `/${branchId}/kitchen`,
    },
  ];

  const getUserRoleText = (role: string) => {
    switch (role) {
      case "super_admin":
        return "ผู้ดูแลระบบ";
      case "branch_owner":
        return "เจ้าของสาขา";
      default:
        return "ผู้ใช้งาน";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-16" : "lg:w-72"
        }`}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 shadow-xl">
          {/* Header */}
          <div
            className={`flex h-16 shrink-0 items-center transition-all duration-300 ${
              sidebarCollapsed ? "justify-center px-2" : "px-6"
            }`}
          >
            {sidebarCollapsed ? (
              <Store className="h-8 w-8 text-gray-900 dark:text-gray-100" />
            ) : (
              <Link
                href={
                  user.role === "super_admin"
                    ? "/branches"
                    : `/${user.branchId}`
                }
                className="flex items-center gap-3"
              >
                <Store className="h-8 w-8 text-gray-900 dark:text-gray-100" />
                <span className="text-lg font-light text-gray-900 dark:text-gray-100">
                  น้ำเต้าหู้พัทลุง
                </span>
              </Link>
            )}
          </div>

          {/* Branch info - only show when not collapsed */}
          {!sidebarCollapsed && (
            <div className="mb-4 px-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                สาขา
              </p>
              <p className="text-lg font-light text-gray-900 dark:text-gray-100">
                {branch.name}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-2">
            <ul className="flex flex-1 flex-col gap-y-7">
              {/* Theme toggle */}
              <li className="px-2 pt-2">
                {sidebarCollapsed ? (
                  <div className="flex justify-center">
                    <ThemeToggle variant="icon" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                    <ThemeToggle variant="switch" />
                  </div>
                )}
              </li>
              <li>
                <ul className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          item.current
                            ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100",
                          "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200",
                          sidebarCollapsed ? "justify-center" : ""
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            item.current
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100",
                            "h-6 w-6 shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        {!sidebarCollapsed && item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Collapse/Expand button */}
              <li className="px-2">
                <Button
                  variant="ghost"
                  onClick={toggleSidebar}
                  className={cn(
                    "w-full text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-all duration-200",
                    sidebarCollapsed ? "justify-center px-0" : "justify-start"
                  )}
                  title={sidebarCollapsed ? "ขยาย Sidebar" : "ย่อ Sidebar"}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <>
                      <ChevronLeft className="mr-3 h-5 w-5" />
                      ย่อ Sidebar
                    </>
                  )}
                </Button>
              </li>

              {/* User info and logout */}
              <li className="mt-auto">
                {!sidebarCollapsed && (
                  <>
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {getUserRoleText(user.role)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-2" />
                  </>
                )}
                <div className="px-2">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-all duration-200",
                      sidebarCollapsed ? "justify-center px-0" : "justify-start"
                    )}
                    onClick={handleLogout}
                    title={sidebarCollapsed ? "ออกจากระบบ" : undefined}
                  >
                    <LogOut
                      className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")}
                    />
                    {!sidebarCollapsed && "ออกจากระบบ"}
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40 bg-white dark:bg-gray-800 shadow-lg"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">เปิดเมนู</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-white dark:bg-gray-800"
        >
          <div className="flex h-full flex-col overflow-y-auto py-6 shadow-xl">
            <div className="px-4 sm:px-6">
              <Link
                href={
                  user.role === "super_admin"
                    ? "/branches"
                    : `/${user.branchId}`
                }
                className="flex items-center gap-3"
                onClick={() => setOpen(false)}
              >
                <Store className="h-8 w-8 text-gray-900 dark:text-gray-100" />
                <span className="text-lg font-light text-gray-900 dark:text-gray-100">
                  น้ำเต้าหู้พัทลุง
                </span>
              </Link>
            </div>
            <div className="px-4 sm:px-6 mt-4 mb-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                สาขา
              </p>
              <p className="text-lg font-light text-gray-900 dark:text-gray-100">
                {branch.name}
              </p>
            </div>
            <div className="relative flex-1 px-4 sm:px-6">
              <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={cn(
                              item.current
                                ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100",
                              "group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200"
                            )}
                            onClick={() => setOpen(false)}
                          >
                            <item.icon
                              className={cn(
                                item.current
                                  ? "text-gray-900 dark:text-gray-100"
                                  : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100",
                                "h-6 w-6 shrink-0"
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* User info for mobile */}
                  <li className="mt-auto">
                    <div className="px-2 py-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {getUserRoleText(user.role)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-all duration-200"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        ออกจากระบบ
                      </Button>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-72"
        }`}
      >
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
