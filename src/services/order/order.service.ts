import { api } from "../api.service";
import {
  Order,
  OrderResponse,
  CreateOrderRequest,
} from "@/interfaces/order.interface";

export const orderService = {
  // POST /orders - แก้ไขเพื่อรองรับการส่ง clientId และ orderBy
  createOrder: async (
    orderData: CreateOrderRequest
  ): Promise<OrderResponse> => {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  // GET /orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get("/orders");
      return response.data.orders || [];
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  },

  // GET /orders/session/:sessionId
  getOrdersForSession: async (sessionId: string): Promise<Order[]> => {
    try {
      const response = await api.get(`/orders/session/${sessionId}`);
      console.log("Orders response raw data:", response.data);

      // เพิ่มการตรวจสอบรูปแบบข้อมูลที่ได้รับ
      if (Array.isArray(response.data)) {
        // กรณีที่ API ส่งคืนเป็น array โดยตรง
        return response.data;
      } else if (response.data && Array.isArray(response.data.orders)) {
        // กรณีที่ API ส่งคืนเป็น { orders: [...] }
        return response.data.orders;
      }

      // กรณีไม่มีข้อมูล
      console.warn("No orders data found in response:", response.data);
      return [];
    } catch (error) {
      console.error("Failed to fetch session orders:", error);
      throw error;
    }
  },

  // GET /orders/table/:tableId
  getOrdersForTable: async (tableId: string): Promise<Order[]> => {
    try {
      const response = await api.get(`/orders/table/${tableId}`);
      console.log("Orders for table response raw data:", response.data);

      // ตรวจสอบรูปแบบข้อมูลที่ได้รับ
      if (Array.isArray(response.data)) {
        // กรณีที่ API ส่งคืนเป็น array โดยตรง
        return response.data;
      } else if (response.data && Array.isArray(response.data.orders)) {
        // กรณีที่ API ส่งคืนเป็น { orders: [...] }
        return response.data.orders;
      }

      // กรณีไม่มีข้อมูล
      console.warn("No orders data found in response:", response.data);
      return [];
    } catch (error) {
      console.error("Failed to fetch table orders:", error);
      throw error;
    }
  },

  // GET /orders/session/:sessionId/client/:clientId - เพิ่ม endpoint สำหรับดึงออร์เดอร์ตามผู้สั่ง
  getOrdersForClient: async (
    sessionId: string,
    clientId: string
  ): Promise<Order[]> => {
    try {
      const response = await api.get(
        `/orders/session/${sessionId}/client/${clientId}`
      );
      return response.data.orders || [];
    } catch (error) {
      console.error("Failed to fetch client orders:", error);
      throw error;
    }
  },

  // GET /orders/branch/:branchId
  getOrdersForBranch: async (
    branchId: string,
    status?: string
  ): Promise<Order[]> => {
    try {
      const url = status
        ? `/orders/branch/${branchId}?status=${status}`
        : `/orders/branch/${branchId}`;

      const response = await api.get(url);
      return response.data.orders || [];
    } catch (error) {
      console.error("Failed to fetch branch orders:", error);
      throw error;
    }
  },

  // GET /orders/:id
  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch order:", error);
      throw error;
    }
  },

  // PATCH /orders/:id
  updateOrder: async (
    orderId: string,
    orderData: Partial<Order>
  ): Promise<OrderResponse> => {
    try {
      const response = await api.patch(`/orders/${orderId}`, orderData);
      return response.data;
    } catch (error) {
      console.error("Failed to update order:", error);
      throw error;
    }
  },

  // PATCH /orders/:id/status
  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<OrderResponse> => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  },

  // DELETE /orders/:id
  deleteOrder: async (orderId: string): Promise<void> => {
    try {
      await api.delete(`/orders/${orderId}`);
    } catch (error) {
      console.error("Failed to delete order:", error);
      throw error;
    }
  },
};
