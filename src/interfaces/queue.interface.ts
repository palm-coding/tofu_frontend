export type QueueStatus = "waiting" | "seated";

export interface QueueItem {
  _id: string;
  branchId: string;
  customerName: string;
  phoneNumber: string;
  partySize: number;
  checkinTime: string;
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewQueueInput {
  customerName: string;
  phoneNumber: string;
  partySize: string;
  checkinTime: string;
}

export interface QueueListResponse {
  queue: QueueItem[];
}

export interface QueueResponse {
  queueItem: QueueItem;
}
