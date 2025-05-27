import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Coffee,
  CupSoda,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Branch } from "@/interfaces/branch.interface";
import { User } from "@/interfaces/user.interface";
import { useEffect, useRef } from "react";

interface BranchSidebarProps {
  branchId: string;
  branch: Branch;
  user: User;
  handleLogout: () => void;
}

export function BranchSidebar({
  branchId,
  branch,
  user,
  handleLogout,
}: BranchSidebarProps) {
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();
  const { theme, setTheme } = useTheme();

  const branchCode = branch.code;

  // เพิ่ม ref เพื่อตรวจสอบว่าได้ทำการย่ออัตโนมัติแล้วหรือยัง
  const autoCollapseApplied = useRef<boolean>(false);

  // ตรวจสอบว่าอยู่ในหน้า kitchen หรือไม่
  const isKitchenPage = pathname === `/${branchId}/kitchen`;

  // เพิ่ม useEffect เพื่อตรวจสอบหน้าปัจจุบันและย่อ sidebar อัตโนมัติ
  useEffect(() => {
    // ทำงานเฉพาะเมื่อเปลี่ยนหน้า
    if (isKitchenPage && !autoCollapseApplied.current) {
      setOpen(false);
      autoCollapseApplied.current = true;
    } else if (!isKitchenPage) {
      // รีเซ็ต ref เมื่อออกจากหน้า kitchen
      autoCollapseApplied.current = false;
    }
  }, [isKitchenPage, setOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleSidebar = () => {
    // ทุกหน้าสามารถย่อขยายได้ตามปกติ
    setOpen(state === "expanded" ? false : true);
  };

  const navigation = [
    {
      name: "แดชบอร์ด",
      href: `/${branchCode}`,
      icon: LayoutDashboard,
      current: pathname === `/${branchCode}`,
    },
    {
      name: "จัดการโต๊ะ",
      href: `/${branchCode}/tables`,
      icon: Coffee,
      current: pathname === `/${branchCode}/tables`,
    },
    {
      name: "จัดการเมนู",
      href: `/${branchCode}/menu`,
      icon: CupSoda,
      current: pathname === `/${branchCode}/menu`,
    },
    {
      name: "จัดการสต็อก",
      href: `/${branchCode}/stock`,
      icon: Package,
      current: pathname === `/${branchCode}/stock`,
    },
    {
      name: "ห้องครัว",
      href: `/${branchCode}/kitchen`,
      icon: ShoppingCart,
      current: pathname === `/${branchCode}/kitchen`,
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

  // Get the first character of the username or name for fallback
  const userInitial = user?.name?.[0] || "U";

  return (
    <div className="hidden lg:block">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="flex justify-center py-4">
          <Link
            href={
              user.role === "super_admin" ? "/branches" : `/${user.branchId}`
            }
            className={`flex ${
              state === "expanded"
                ? "items-center gap-2 px-4"
                : "justify-center"
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <Store className="h-7 w-7 text-gray-900 dark:text-gray-100" />
            </div>
            {state === "expanded" && (
              <span className="text-lg font-medium">น้ำเต้าหู้พัทลุง</span>
            )}
          </Link>
        </SidebarHeader>

        {state === "expanded" && (
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              สาขา
            </p>
            <p className="text-lg font-light text-gray-900 dark:text-gray-100">
              {branch.name}
            </p>
          </div>
        )}

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>เมนู</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.current}
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>อื่นๆ</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* ปุ่มสำหรับย่อขยาย sidebar - แสดงเหมือนกันในทุกหน้า */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={toggleSidebar}
                    tooltip={state === "expanded" ? "ย่อเมนู" : "ขยายเมนู"}
                  >
                    {state === "expanded" ? (
                      <ChevronLeft className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <span>{state === "expanded" ? "ย่อเมนู" : "ขยายเมนู"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* ปุ่ม toggle theme */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={toggleTheme}
                    tooltip={theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                    <span>{theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div
            className={`p-3 ${
              state === "collapsed" ? "flex justify-center" : ""
            }`}
          >
            {state === "expanded" ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{user.name || "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">
                    {getUserRoleText(user.role)}
                  </span>
                </div>
                <LogOut className="ml-auto h-4 w-4" />
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  title="ออกจากระบบ"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
