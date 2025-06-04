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
      return response.data || [];
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

  // GET /orders/analytics/weekly-sales
  getWeeklySales: async (
    branchId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<OrderResponse> => {
    try {
      const params: Record<string, string> = {};
      if (branchId) params.branchId = branchId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("/orders/analytics/weekly-sales", {
        params,
      });
      console.log("Weekly sales response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch weekly sales:", error);
      throw error;
    }
  },

  // GET /orders/analytics/popular-menu
  getPopularMenuItems: async (
    branchId?: string,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<OrderResponse> => {
    try {
      const params: Record<string, string | number> = { limit };
      if (branchId) params.branchId = branchId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("/orders/analytics/popular-menu", {
        params,
      });
      console.log("Popular menu items response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch popular menu items:", error);
      throw error;
    }
  },

  // GET /orders/analytics/hourly-sales
  getHourlySales: async (
    branchId?: string,
    date?: string
  ): Promise<OrderResponse> => {
    try {
      const params: Record<string, string> = {};
      if (branchId) params.branchId = branchId;
      if (date) params.date = date;

      const response = await api.get("/orders/analytics/hourly-sales", {
        params,
      });
      console.log("Hourly sales response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch hourly sales:", error);
      throw error;
    }
  },

  // GET /orders/analytics/sales-by-period

  getSalesByTimePeriod: async (
    branchId?: string,
    startDate?: string,
    endDate?: string,
    groupBy: "hour" | "day" | "week" | "month" = "day"
  ): Promise<OrderResponse> => {
    try {
      const params: Record<string, string> = { groupBy };
      if (branchId) params.branchId = branchId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("/orders/analytics/sales-by-period", {
        params,
      });
      console.log("Sales by time period response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch sales by time period:", error);
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
