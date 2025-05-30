import {
  QueueItem,
  QueueListResponse,
  QueueResponse,
  QueueStatus,
  NewQueueInput,
} from "@/interfaces/queue.interface";

// ยังคงใช้ mock data สำหรับ queue
const mockQueue: QueueItem[] = [
  {
    _id: "queue1",
    branchId: "branch1",
    customerName: "คุณสมชาย",
    phoneNumber: "081-234-5678",
    partySize: 4,
    checkinTime: "18:00",
    status: "waiting",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    _id: "queue2",
    branchId: "branch1",
    customerName: "คุณมาลี",
    phoneNumber: "089-876-5432",
    partySize: 2,
    checkinTime: "19:30",
    status: "waiting",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    _id: "queue3",
    branchId: "branch1",
    customerName: "คุณวิชัย",
    phoneNumber: "092-111-2222",
    partySize: 6,
    checkinTime: "20:00",
    status: "seated",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
];

export const queueService = {
  getQueue: async (branchId: string): Promise<QueueListResponse> => {
    console.log("Fetching queue for branch:", branchId);
    try {
      return await new Promise((resolve) => {
        setTimeout(() => {
          // ตรวจสอบว่ามีคิวที่ตรงกับ branchId หรือไม่
          let queueForBranch = mockQueue.filter(
            (q) => q.branchId === branchId || q.branchId === "branch1"
          );

          // ถ้าไม่พบข้อมูล ให้ใช้ข้อมูลทั้งหมด (สำหรับทดสอบ)
          if (queueForBranch.length === 0) {
            console.log(
              "No queue found for branchId:",
              branchId,
              "- using all queue items for testing"
            );
            queueForBranch = mockQueue;
          }

          console.log(
            "Queue filtered for branch:",
            branchId,
            "- count:",
            queueForBranch.length
          );
          resolve({ queue: queueForBranch });
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
            _id: `queue${Date.now()}`,
            branchId,
            customerName: queueData.customerName,
            phoneNumber: queueData.phoneNumber,
            partySize: Number.parseInt(queueData.partySize),
            checkinTime: queueData.checkinTime,
            status: "waiting",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const queueIndex = mockQueue.findIndex(
            (q) =>
              q._id === queueId &&
              (q.branchId === branchId || q.branchId === "branch1")
          );

          if (queueIndex === -1) {
            reject(new Error("Queue item not found"));
            return;
          }

          const updatedQueueItem = {
            ...mockQueue[queueIndex],
            status,
            updatedAt: new Date().toISOString(),
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
      return await new Promise((resolve, reject) => {
        setTimeout(() => {
          const queueIndex = mockQueue.findIndex(
            (q) =>
              q._id === queueId &&
              (q.branchId === branchId || q.branchId === "branch1")
          );

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
};
