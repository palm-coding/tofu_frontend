import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Coffee,
  CupSoda,
  LayoutDashboard,
  LogOut,
  MenuIcon,
  Package,
  ShoppingCart,
  Store,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Branch } from "@/interfaces/branch.interface";
import { User } from "@/interfaces/user.interface";

interface BranchMobileMenuProps {
  branch: Branch;
  user: User;
  branchId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleLogout: () => void;
}

export function BranchMobileMenu({
  branch,
  user,
  branchId,
  open,
  setOpen,
  handleLogout,
}: BranchMobileMenuProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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

  // Get the first character of the username or name for fallback
  const userInitial = user?.name?.[0] || "U";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-40 bg-background shadow-md"
        >
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">เปิดเมนู</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-background">
        <SheetTitle className="sr-only">เมนูสาขา {branch.name}</SheetTitle>
        <div className="flex h-full flex-col overflow-y-auto py-6 shadow-xl">
          <div className="px-4 sm:px-6">
            <Link
              href={
                user.role === "super_admin" ? "/branches" : `/${user.branchId}`
              }
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <Store className="h-8 w-8 text-gray-900 dark:text-gray-100" />
              <span className="text-lg font-medium">น้ำเต้าหู้พัทลุง</span>
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

                {/* Theme toggle */}
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-all duration-200"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? (
                      <Sun className="mr-3 h-5 w-5" />
                    ) : (
                      <Moon className="mr-3 h-5 w-5" />
                    )}
                    {theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}
                  </Button>
                </li>

                {/* User info for mobile */}
                <li className="mt-auto">
                  <div className="px-2 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{userInitial}</AvatarFallback>
                      </Avatar>
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
  );
}
