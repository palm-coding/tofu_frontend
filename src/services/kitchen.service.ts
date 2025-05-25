// import axios from "axios";
import {
  GetOrdersResponse,
  KitchenOrder,
  OrdersFilterOptions,
  UpdateOrderItemStatusRequest,
  UpdateOrderResponse,
  UpdateOrderStatusRequest,
} from "@/interfaces/kitchen.interface";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true, // สำคัญมาก! ช่วยให้ส่ง cookies ได้
// });

// Mock orders data
const mockOrders: KitchenOrder[] = [
  {
    id: "order1",
    tableId: "1",
    tableName: "โต๊ะ 1",
    customerName: "คุณสมชาย",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    items: [
      {
        id: "item1",
        name: "น้ำเต้าหู้ร้อน",
        quantity: 2,
        note: "หวานน้อย",
        status: "pending",
      },
      {
        id: "item4",
        name: "ปาท่องโก๋",
        quantity: 4,
        note: "",
        status: "pending",
      },
    ],
  },
  {
    id: "order2",
    tableId: "5",
    tableName: "โต๊ะ 5",
    customerName: "คุณนภา",
    status: "preparing",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12 minutes ago
    items: [
      {
        id: "item2",
        name: "น้ำเต้าหู้เย็น",
        quantity: 1,
        note: "ไม่ใส่น้ำแข็ง",
        status: "preparing",
      },
      {
        id: "item3",
        name: "น้ำเต้าหู้ปั่น",
        quantity: 1,
        note: "",
        status: "preparing",
      },
      {
        id: "item5",
        name: "ขนมไข่",
        quantity: 2,
        note: "",
        status: "preparing",
      },
    ],
  },
  {
    id: "order3",
    tableId: "8",
    tableName: "โต๊ะ 8",
    customerName: "คุณวิชัย",
    status: "served",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
    items: [
      {
        id: "item1",
        name: "น้ำเต้าหู้ร้อน",
        quantity: 3,
        note: "",
        status: "served",
      },
      {
        id: "item6",
        name: "เต้าฮวยฟรุตสลัด",
        quantity: 1,
        note: "ไม่ใส่แตงโม",
        status: "served",
      },
    ],
  },
];

export const kitchenService = {
  // Get all orders for a kitchen, with optional filtering
  getOrders: async (
    options: OrdersFilterOptions
  ): Promise<GetOrdersResponse> => {
    try {
      // In a real app, we would call the API:
      // const response = await api.get(`/branches/${options.branchId}/kitchen/orders`, {
      //   params: { status: options.status, limit: options.limit }
      // });
      // return response.data;

      // For now, simulate API call with mock data
      return await new Promise((resolve) => {
        setTimeout(() => {
          let filteredOrders = [...mockOrders];

          // Filter by status if provided
          if (options.status) {
            filteredOrders = filteredOrders.filter(
              (order) => order.status === options.status
            );
          }

          // Filter by branch ID (in real app)
          // Currently our mock doesn't have branchId, but we're simulating

          // Apply limit if provided
          if (options.limit && options.limit > 0) {
            filteredOrders = filteredOrders.slice(0, options.limit);
          }

          resolve({ orders: filteredOrders });
        }, 500); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch kitchen orders:", error);
      throw error;
    }
  },

  // Update order status (move between columns)
  updateOrderStatus: async (
    branchId: string,
    request: UpdateOrderStatusRequest
  ): Promise<UpdateOrderResponse> => {
    try {
      // In a real app:
      // const response = await api.put(`/branches/${branchId}/kitchen/orders/${request.orderId}/status`, {
      //   status: request.status
      // });
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Find the order to update
          const orderIndex = mockOrders.findIndex(
            (o) => o.id === request.orderId
          );

          if (orderIndex === -1) {
            reject(new Error("Order not found"));
            return;
          }

          // Update the order and all its items
          const updatedOrder = {
            ...mockOrders[orderIndex],
            status: request.status,
            items: mockOrders[orderIndex].items.map((item) => ({
              ...item,
              status: request.status,
            })),
          };

          // Update the mock data (this would be handled by the database in a real app)
          mockOrders[orderIndex] = updatedOrder;

          resolve({ order: updatedOrder });
        }, 300);
      });
    } catch (error) {
      console.error(
        `Failed to update order status for ${request.orderId}:`,
        error
      );
      throw error;
    }
  },

  // Update individual item status
  updateOrderItemStatus: async (
    branchId: string,
    request: UpdateOrderItemStatusRequest
  ): Promise<UpdateOrderResponse> => {
    try {
      // In a real app:
      // const response = await api.put(
      //   `/branches/${branchId}/kitchen/orders/${request.orderId}/items/${request.itemId}/status`,
      //   { status: request.status }
      // );
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Find the order
          const orderIndex = mockOrders.findIndex(
            (o) => o.id === request.orderId
          );

          if (orderIndex === -1) {
            reject(new Error("Order not found"));
            return;
          }

          // Find and update the specific item
          const updatedItems = mockOrders[orderIndex].items.map((item) => {
            if (item.id === request.itemId) {
              return { ...item, status: request.status };
            }
            return item;
          });

          // Check if all items are now served
          const allServed = updatedItems.every(
            (item) => item.status === "served"
          );

          // Update the order status if all items are served
          const updatedOrder = {
            ...mockOrders[orderIndex],
            items: updatedItems,
            status: allServed ? "served" : mockOrders[orderIndex].status,
          };

          // If all items are preparing/served, make sure order status is at least preparing
          if (
            updatedItems.every((item) => item.status !== "pending") &&
            updatedOrder.status === "pending"
          ) {
            updatedOrder.status = "preparing";
          }

          // Update the mock data
          mockOrders[orderIndex] = updatedOrder;

          resolve({ order: updatedOrder });
        }, 300);
      });
    } catch (error) {
      console.error(
        `Failed to update item status for ${request.orderId}/${request.itemId}:`,
        error
      );
      throw error;
    }
  },

  // Optional: Poll for new orders (simulating real-time updates)
  pollForNewOrders: async (
    branchId: string,
    lastOrderTimestamp?: string
  ): Promise<GetOrdersResponse> => {
    try {
      // In a real app, this would likely use WebSockets or Server-Sent Events
      // For mock purposes, we'll just return orders newer than the timestamp

      return await new Promise((resolve) => {
        setTimeout(() => {
          let newOrders = [...mockOrders];

          if (lastOrderTimestamp) {
            const lastTime = new Date(lastOrderTimestamp).getTime();
            newOrders = newOrders.filter((order) => {
              const orderTime = new Date(order.createdAt).getTime();
              return orderTime > lastTime;
            });
          }

          resolve({ orders: newOrders });
        }, 2000); // Longer delay to simulate polling interval
      });
    } catch (error) {
      console.error("Failed to poll for new orders:", error);
      throw error;
    }
  },
};
