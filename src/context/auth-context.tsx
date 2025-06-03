"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  ComponentType,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { User } from "@/interfaces/user.interface";
import { branchService } from "@/services/branch.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAccess: (requiredRole?: string) => Promise<boolean>;
}

// สร้าง Context สำหรับข้อมูล Authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component ที่จะห่อหุ้มแอพพลิเคชัน
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // ฟังก์ชั่นตรวจสอบว่าเป็น public path หรือไม่ (เพิ่มใหม่)
  const isPublicPath = () => {
    return (
      pathname === "/" ||
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/order")
    ); // เพิ่ม /order
  };

  // ฟังก์ชั่นเช็คสถานะ authentication เมื่อโหลดแอพ
  const checkAuthStatus = useCallback(async () => {
    // เช็คก่อนทันทีว่าเป็น public path หรือไม่
    if (isPublicPath()) {
      // แก้ไขตรงนี้
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      // ถ้าไม่มีข้อมูลผู้ใช้ และไม่ได้อยู่ที่ public path ให้ redirect
      if (!currentUser) {
        router.push("/");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setUser(null);

      // ถ้าเกิด error ให้ redirect กลับหน้าหลัก
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  // เช็คสถานะเมื่อโหลดแอพครั้งแรกหรือเมื่อ pathname เปลี่ยน
  useEffect(() => {
    checkAuthStatus();

    // สร้าง event listener สำหรับ logout event
    const handleLogout = () => {
      setUser(null);

      // redirect ถ้าไม่อยู่ที่ public path
      if (!isPublicPath()) {
        // แก้ไขตรงนี้
        router.push("/");
      }
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [checkAuthStatus, pathname, router]);

  // ฟังก์ชั่นล็อกอิน
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const userData = await authService.login({ email, password });
      setUser(userData);

      // หลังจากล็อกอินสำเร็จ ให้นำทางตามบทบาท
      if (userData.role === "super_admin") {
        router.push("/branches");
      } else if (userData.role === "branch_owner" && userData.branchId) {
        // ดึงข้อมูล branch เพื่อเอา code มาใช้ใน URL
        try {
          const branchData = await branchService.getBranchById(
            userData.branchId
          );
          if (branchData && branchData.code) {
            router.push(`/${branchData.code}`);
          } else {
            // Fallback ถ้าหาไม่พบ
            router.push(`/${userData.branchId}`);
          }
        } catch (err) {
          console.error("Error fetching branch details:", err);
          // Fallback ถ้ามีข้อผิดพลาด
          router.push(`/${userData.branchId}`);
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชั่นล็อกเอาท์
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      router.push("/");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการออกจากระบบ";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบการเข้าถึงตาม role
  const checkAccess = async (requiredRole?: string) => {
    // ข้ามการตรวจสอบถ้าอยู่ที่หน้าหลัก
    if (isPublicPath()) {
      return true;
    }
    return await authService.checkAccess(requiredRole);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook สำหรับเข้าถึงข้อมูล authentication
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC สำหรับป้องกันหน้าที่ต้องล็อกอิน
export function withAuth<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: string
) {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // ฟังก์ชั่นตรวจสอบว่าเป็น public path หรือไม่ (เพิ่มใหม่)
    const isPublicPath = () => {
      return (
        pathname === "/" ||
        pathname?.startsWith("/login") ||
        pathname?.startsWith("/order")
      ); // เพิ่ม /order
    };

    useEffect(() => {
      // ข้ามการตรวจสอบถ้าอยู่ที่หน้าหลัก
      if (isPublicPath()) {
        return;
      }

      async function checkPermission() {
        if (!loading) {
          const hasAccess = await authService.checkAccess(requiredRole);
          if (!hasAccess) {
            router.push("/");
          }
        }
      }
      checkPermission();
    }, [loading, router, pathname]);

    // ข้ามการตรวจสอบถ้าอยู่ที่หน้าหลัก
    if (isPublicPath()) {
      return <Component {...props} />;
    }

    // แสดงหน้าโหลดในระหว่างตรวจสอบสถานะ
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-10 w-10 border-4 border-muted rounded-full border-t-primary mb-4"></div>
            <p className="text-muted-foreground">กำลังโหลด...</p>
          </div>
        </div>
      );
    }

    // ถ้าไม่มีการล็อกอิน ให้แสดงหน้าโหลดระหว่าง redirect
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

    // ถ้าผ่านการตรวจสอบทั้งหมด ให้แสดงหน้าที่ต้องการ
    return <Component {...props} />;
  };
}

export default useAuth;
