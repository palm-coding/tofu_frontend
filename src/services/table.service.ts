// import axios from "axios";
import {
  TableItem,
  QueueItem,
  TableListResponse,
  QueueListResponse,
  TableResponse,
  QueueResponse,
  NewQueueInput,
  QueueStatus,
} from "@/interfaces/table.interface";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// Mock tables data
const mockTables: TableItem[] = [
  { id: "1", name: "โต๊ะ 1", status: "available", capacity: 2 },
  {
    id: "2",
    name: "โต๊ะ 2",
    status: "occupied",
    capacity: 4,
    checkinTime: "14:30",
    customerName: "ลูกค้า",
    sessionId: "branch1_2_1703123456789",
    orders: [
      {
        id: "order1",
        status: "preparing",
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        items: [
          {
            id: "item1",
            name: "น้ำเต้าหู้ร้อน",
            quantity: 2,
            price: 25,
            note: "หวานน้อย",
            status: "preparing",
          },
          {
            id: "item4",
            name: "ปาท่องโก๋",
            quantity: 4,
            price: 10,
            note: "",
            status: "preparing",
          },
        ],
        total: 90,
      },
    ],
  },
  { id: "3", name: "โต๊ะ 3", status: "available", capacity: 4 },
  { id: "4", name: "โต๊ะ 4", status: "available", capacity: 2 },
  {
    id: "5",
    name: "โต๊ะ 5",
    status: "occupied",
    capacity: 6,
    checkinTime: "15:15",
    customerName: "ลูกค้า",
    sessionId: "branch1_5_1703123456790",
    orders: [
      {
        id: "order2",
        status: "served",
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
        items: [
          {
            id: "item2",
            name: "น้ำเต้าหู้เย็น",
            quantity: 1,
            price: 30,
            note: "ไม่ใส่น้ำแข็ง",
            status: "served",
          },
          {
            id: "item3",
            name: "น้ำเต้าหู้ปั่น",
            quantity: 1,
            price: 35,
            note: "",
            status: "served",
          },
        ],
        total: 65,
      },
      {
        id: "order3",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        items: [
          {
            id: "item5",
            name: "ขนมไข่",
            quantity: 2,
            price: 15,
            note: "",
            status: "pending",
          },
        ],
        total: 30,
      },
    ],
  },
  { id: "6", name: "โต๊ะ 6", status: "available", capacity: 4 },
  { id: "7", name: "โต๊ะ 7", status: "available", capacity: 2 },
  {
    id: "8",
    name: "โต๊ะ 8",
    status: "occupied",
    capacity: 4,
    checkinTime: "16:00",
    customerName: "ลูกค้า",
    sessionId: "branch1_8_1703123456791",
    orders: [
      {
        id: "order4",
        status: "served",
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        items: [
          {
            id: "item1",
            name: "น้ำเต้าหู้ร้อน",
            quantity: 3,
            price: 25,
            note: "",
            status: "served",
          },
          {
            id: "item6",
            name: "เต้าฮวยฟรุตสลัด",
            quantity: 1,
            price: 45,
            note: "ไม่ใส่แตงโม",
            status: "served",
          },
        ],
        total: 120,
      },
    ],
  },
  { id: "9", name: "โต๊ะ 9", status: "available", capacity: 2 },
  { id: "10", name: "โต๊ะ 10", status: "available", capacity: 8 },
  { id: "11", name: "โต๊ะ 11", status: "available", capacity: 4 },
  { id: "12", name: "โต๊ะ 12", status: "available", capacity: 2 },
];

// Mock queue data
const mockQueue: QueueItem[] = [
  {
    id: "queue1",
    customerName: "คุณสมชาย",
    phoneNumber: "081-234-5678",
    partySize: 4,
    checkinTime: "18:00",
    status: "waiting",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "queue2",
    customerName: "คุณมาลี",
    phoneNumber: "089-876-5432",
    partySize: 2,
    checkinTime: "19:30",
    status: "waiting",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "queue3",
    customerName: "คุณวิชัย",
    phoneNumber: "092-111-2222",
    partySize: 6,
    checkinTime: "20:00",
    status: "seated",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
];

export const tableService = {
  // Table methods
  getTables: async (branchId: string): Promise<TableListResponse> => {
    console.log("Fetching tables for branch:", branchId);
    try {
      // In a real app, we would call the API
      // const response = await api.get(`/branches/${branchId}/tables`);
      // return response.data;

      // Simulate API call with mock data
      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ tables: mockTables });
        }, 500); // Simulate network delay
      });
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      throw error;
    }
  },

  getTableById: async (
    branchId: string,
    tableId: string
  ): Promise<TableResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/tables/${tableId}`);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const table = mockTables.find((t) => t.id === tableId);
          if (table) {
            resolve({ table });
          } else {
            reject(new Error("Table not found"));
          }
        }, 300);
      });
    } catch (error) {
      console.error("Failed to fetch table details:", error);
      throw error;
    }
  },

  tableCheckin: async (
    branchId: string,
    tableId: string
  ): Promise<TableResponse> => {
    try {
      // In a real app:
      // const response = await api.post(`/branches/${branchId}/tables/${tableId}/checkin`);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const tableIndex = mockTables.findIndex((t) => t.id === tableId);

          if (tableIndex === -1) {
            reject(new Error("Table not found"));
            return;
          }

          if (mockTables[tableIndex].status !== "available") {
            reject(new Error("Table is not available"));
            return;
          }

          const sessionId = `${branchId}_${tableId}_${Date.now()}`;
          const updatedTable: TableItem = {
            ...mockTables[tableIndex],
            status: "occupied",
            checkinTime: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            customerName: "ลูกค้า",
            sessionId,
            orders: [],
          };

          // Update the mock data
          mockTables[tableIndex] = updatedTable;

          resolve({ table: updatedTable });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to check in table:", error);
      throw error;
    }
  },

  tableCheckout: async (
    branchId: string,
    tableId: string
  ): Promise<TableResponse> => {
    try {
      // In a real app:
      // const response = await api.post(`/branches/${branchId}/tables/${tableId}/checkout`);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const tableIndex = mockTables.findIndex((t) => t.id === tableId);

          if (tableIndex === -1) {
            reject(new Error("Table not found"));
            return;
          }

          const updatedTable: TableItem = {
            ...mockTables[tableIndex],
            status: "available",
            checkinTime: undefined,
            customerName: undefined,
            sessionId: undefined,
            orders: undefined,
          };

          // Update the mock data
          mockTables[tableIndex] = updatedTable;

          resolve({ table: updatedTable });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to check out table:", error);
      throw error;
    }
  },

  // Queue methods
  getQueue: async (branchId: string): Promise<QueueListResponse> => {
    console.log("Fetching queue for branch:", branchId);
    try {
      // In a real app:
      // const response = await api.get(`/branches/${branchId}/queue`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ queue: mockQueue });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to fetch queue:", error);
      throw error;
    }
  },

  addToQueue: async (
    branchId: string,
    queueData: NewQueueInput
  ): Promise<QueueResponse> => {
    try {
      // In a real app:
      // const response = await api.post(`/branches/${branchId}/queue`, queueData);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (
            !queueData.customerName ||
            !queueData.partySize ||
            !queueData.checkinTime
          ) {
            reject(new Error("Missing required fields"));
            return;
          }

          const queueItem: QueueItem = {
            id: `queue${Date.now()}`,
            customerName: queueData.customerName,
            phoneNumber: queueData.phoneNumber,
            partySize: Number.parseInt(queueData.partySize),
            checkinTime: queueData.checkinTime,
            status: "waiting",
            createdAt: new Date().toISOString(),
          };

          // Add to mock data
          mockQueue.push(queueItem);

          resolve({ queueItem });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to add to queue:", error);
      throw error;
    }
  },

  updateQueueStatus: async (
    branchId: string,
    queueId: string,
    status: QueueStatus
  ): Promise<QueueResponse> => {
    try {
      // In a real app:
      // const response = await api.put(`/branches/${branchId}/queue/${queueId}`, { status });
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const queueIndex = mockQueue.findIndex((q) => q.id === queueId);

          if (queueIndex === -1) {
            reject(new Error("Queue item not found"));
            return;
          }

          const updatedQueueItem = {
            ...mockQueue[queueIndex],
            status,
          };

          // Update the mock data
          mockQueue[queueIndex] = updatedQueueItem;

          resolve({ queueItem: updatedQueueItem });
        }, 300);
      });
    } catch (error) {
      console.error("Failed to update queue status:", error);
      throw error;
    }
  },

  removeFromQueue: async (branchId: string, queueId: string): Promise<void> => {
    try {
      // In a real app:
      // await api.delete(`/branches/${branchId}/queue/${queueId}`);

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const queueIndex = mockQueue.findIndex((q) => q.id === queueId);

          if (queueIndex === -1) {
            reject(new Error("Queue item not found"));
            return;
          }

          // Remove from mock data
          mockQueue.splice(queueIndex, 1);

          resolve();
        }, 300);
      });
    } catch (error) {
      console.error("Failed to remove from queue:", error);
      throw error;
    }
  },

  markTableAsPaid: async (
    branchId: string,
    tableId: string
  ): Promise<TableResponse> => {
    try {
      // In a real app:
      // const response = await api.post(`/branches/${branchId}/tables/${tableId}/pay`);
      // return response.data;

      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const tableIndex = mockTables.findIndex((t) => t.id === tableId);

          if (tableIndex === -1) {
            reject(new Error("Table not found"));
            return;
          }

          // In a real app, we would update the payment status
          // For now, we'll just return the same table data
          resolve({ table: mockTables[tableIndex] });
        }, 300);
      });
    } catch (error) {
      console.error("Failed to mark table as paid:", error);
      throw error;
    }
  },
};
