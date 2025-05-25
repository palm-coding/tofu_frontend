// services/auth.service.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // สำคัญมาก! ช่วยให้ส่ง cookies ได้
});

export const authService = {};
