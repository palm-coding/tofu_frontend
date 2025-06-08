import { api } from "../api.service"; 
import {
  Payment,
  CreatePaymentDto,
  PromptPayPaymentDto,
  PaymentStatus,
} from "@/interfaces/payment.interface";

export const paymentService = {
  // สร้างรายการชำระเงินใหม่ (เช่น เงินสด)
  createPayment: async (paymentData: CreatePaymentDto): Promise<Payment> => {
    try {
      const response = await api.post("/payments", paymentData);
      return response.data;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error;
    }
  },

  // ดึงรายการชำระเงินทั้งหมด
  getAllPayments: async (): Promise<Payment[]> => {
    try {
      const response = await api.get("/payments");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      throw error;
    }
  },

  // ค้นหารายการชำระเงินของออร์เดอร์
  getPaymentsByOrder: async (orderId: string): Promise<Payment[]> => {
    try {
      const response = await api.get(`/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payments for order ${orderId}:`, error);
      throw error;
    }
  },

  // ค้นหารายการชำระเงินของเซสชัน
  getPaymentsBySession: async (sessionId: string): Promise<Payment[]> => {
    try {
      const response = await api.get(`/payments/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch payments for session ${sessionId}:`,
        error
      );
      throw error;
    }
  },

  // ค้นหารายการชำระเงินของสาขา
  getPaymentsByBranch: async (
    branchId: string,
    status?: PaymentStatus
  ): Promise<Payment[]> => {
    try {
      let url = `/payments/branch/${branchId}`;
      if (status) {
        url += `?status=${status}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payments for branch ${branchId}:`, error);
      throw error;
    }
  },

  // ดูรายละเอียดรายการชำระเงินเดี่ยว
  getPaymentById: async (paymentId: string): Promise<Payment> => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch payment ${paymentId}:`, error);
      throw error;
    }
  },

  // อัปเดตข้อมูลรายการชำระเงิน
  updatePayment: async (
    paymentId: string,
    paymentData: Partial<CreatePaymentDto>
  ): Promise<Payment> => {
    try {
      const response = await api.patch(`/payments/${paymentId}`, paymentData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update payment ${paymentId}:`, error);
      throw error;
    }
  },

  // อัปเดตเฉพาะสถานะการชำระเงิน
  updatePaymentStatus: async (
    paymentId: string,
    status: PaymentStatus
  ): Promise<Payment> => {
    try {
      const response = await api.patch(
        `/payments/${paymentId}/status/${status}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update payment status ${paymentId}:`, error);
      throw error;
    }
  },

  // ลบรายการชำระเงิน
  deletePayment: async (paymentId: string): Promise<void> => {
    try {
      await api.delete(`/payments/${paymentId}`);
    } catch (error) {
      console.error(`Failed to delete payment ${paymentId}:`, error);
      throw error;
    }
  },

  // สร้าง QR Code PromptPay สำหรับชำระเงิน
  createPromptPayQR: async (
    paymentData: PromptPayPaymentDto
  ): Promise<Payment> => {
    console.log("Creating PromptPay QR with data:", paymentData);
    try {
      const response = await api.post("/payments/promptpay", paymentData);
      return response.data;
    } catch (error) {
      console.error("Failed to create PromptPay QR code:", error);
      throw error;
    }
  },

  // ตรวจสอบสถานะการชำระเงิน PromptPay
  checkPaymentStatus: async (paymentId: string): Promise<Payment> => {
    try {
      const response = await api.get(`/payments/${paymentId}/check-status`);
      return response.data;
    } catch (error) {
      console.error(`Failed to check payment status ${paymentId}:`, error);
      throw error;
    }
  },
};
