import { api } from "@/services/api.service";
import {
  QueueItem,
  QueueListResponse,
  QueueResponse,
  QueueStatus,
  NewQueueInput,
} from "@/interfaces/queue.interface";

// เปลี่ยนจาก mock เป็นเรียก API จริง
export const queueService = {
  getQueue: async (): Promise<QueueListResponse> => {
    try {
      const response = await api.get("/waitlist");
      return { queue: response.data }; // สมมติ API ส่ง array ของ waitlist
    } catch (error) {
      console.error("Failed to fetch queue:", error);
      throw error;
    }
  },

  addToQueue: async (queueData: NewQueueInput): Promise<QueueResponse> => {
    try {
      const response = await api.post("/waitlist", queueData);
      return { queueItem: response.data }; // สมมติ API ส่ง object เดียวกลับมา
    } catch (error) {
      console.error("Failed to add to queue:", error);
      throw error;
    }
  },

  updateQueueStatus: async (
    queueId: string,
    status: QueueStatus
  ): Promise<QueueResponse> => {
    try {
      const response = await api.patch(`/waitlist/${queueId}`, { status });
      return { queueItem: response.data };
    } catch (error) {
      console.error("Failed to update queue status:", error);
      throw error;
    }
  },

  removeFromQueue: async (queueId: string): Promise<void> => {
    try {
      await api.delete(`/waitlist/${queueId}`);
    } catch (error) {
      console.error("Failed to remove from queue:", error);
      throw error;
    }
  },

  getQueueById: async (queueId: string): Promise<QueueItem> => {
    try {
      const response = await api.get(`/waitlist/${queueId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch queue by id:", error);
      throw error;
    }
  },
};
