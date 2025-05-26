import axios from "axios";
import { LoginRequest, User } from "@/interfaces/user.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // สำคัญมาก! ช่วยให้ส่ง/รับ cookies ได้
});

// ข้อมูลผู้ใช้งานจริงจะมาจาก API
export const authService = {
  // เข้าสู่ระบบและรับ token ผ่าน HTTP-only cookie
  login: async (credentials: LoginRequest): Promise<User> => {
    try {
      // 1. เรียก endpoint login เพื่อรับ token (HTTP-only cookie)
      await api.post("/auth/login", credentials);

      // 2. เรียก endpoint เพื่อดึงข้อมูล user โดยใช้ cookie ที่ได้รับ
      const userResponse = await api.get("/users/profile");
      console.log("Login API user response:", userResponse.data);

      // แก้ไขตรงนี้: ตรวจสอบทั้งกรณี response.data.user และ response.data
      if (!userResponse.data) {
        throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }

      // ถ้า response.data มี property user ให้ใช้ response.data.user
      if (userResponse.data.user) {
        return userResponse.data.user;
      }

      // ถ้าไม่มี property user แต่มีข้อมูลที่จำเป็น (มี role) ใช้ response.data
      if (userResponse.data.role) {
        // แปลง _id เป็น id ถ้าจำเป็น
        if (userResponse.data._id && !userResponse.data.id) {
          userResponse.data.id = userResponse.data._id;
        }
        return userResponse.data;
      }

      throw new Error("โครงสร้างข้อมูลผู้ใช้ไม่ถูกต้อง");
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        } else if (error.response?.data?.message) {
          throw new Error(error.response.data.message as string);
        }
      }
      throw new Error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  },

  // ออกจากระบบและลบ cookie
  logout: async (): Promise<void> => {
    try {
      await api.get("/auth/logout");
      // Server จะล้าง cookie ให้อัตโนมัติ
    } catch (error) {
      console.error("Logout error:", error);
      // แม้จะมี error เราก็ควรล้างข้อมูล user ใน state
    }
  },

  // ตรวจสอบว่ามี token ที่ใช้งานได้
  hasValidToken: async (): Promise<boolean> => {
    try {
      await api.get("/users/profile");
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      console.error("Token check error:", error);
      return false;
    }
  },

  // ตรวจสอบสถานะการเข้าสู่ระบบของผู้ใช้
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // ตรวจสอบว่ามี cookie ที่ได้รับจาก API หรือไม่
      const response = await api.get("/users/profile");

      if (!response.data) {
        return null;
      }

      // ถ้า response.data มี property user ให้ใช้ response.data.user
      if (response.data.user) {
        return response.data.user;
      }

      // ถ้าไม่มี property user แต่มีข้อมูลที่จำเป็น (เช่น role) ใช้ response.data
      if (response.data.role) {
        return response.data;
      }

      return null;
    } catch (error: unknown) {
      console.error("getCurrentUser error:", error);
      // เปลี่ยนจาก throw error เป็น return null เพื่อไม่ให้เกิด exception
      return null;
    }
  },

  // ฟังก์ชั่นสำหรับตรวจสอบการเข้าถึง route ที่ต้องมีสิทธิ์เฉพาะ
  checkAccess: async (requiredRole?: string): Promise<boolean> => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return false;

      // ถ้าไม่ระบุ role ที่ต้องการ แค่ login อยู่ก็พอ
      if (!requiredRole) return true;

      // ตรวจสอบ role
      if (requiredRole === "super_admin" && user.role === "super_admin") {
        return true;
      }

      if (
        requiredRole === "branch_owner" &&
        (user.role === "branch_owner" || user.role === "super_admin")
      ) {
        return true;
      }

      return false;
    } catch (_error) {
      console.error("checkAccess error:", _error);
      return false;
    }
  },
};

// สำหรับ API interceptors ในกรณีที่ต้องจัดการเรื่อง token หมดอายุ
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ถ้า API ตอบกลับด้วย status 401 (Unauthorized)
    if (error.response?.status === 401) {
      // ลบข้อมูลใน local state หรือ context
      window.dispatchEvent(new CustomEvent("auth:logout"));

      // ถ้าไม่อยู่ที่หน้าหลักหรือหน้า login ให้ redirect ไปที่หน้าหลัก
      const pathname = window.location.pathname;
      // แก้ไขเงื่อนไขนี้ - !pathname.startsWith("/") จะเป็น false เสมอ
      // เพราะทุก path เริ่มต้นด้วย "/"
      if (pathname !== "/" && !pathname.startsWith("/login")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
