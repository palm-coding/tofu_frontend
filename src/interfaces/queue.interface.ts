export type QueueStatus = "waiting" | "notified" | "seated" | "cancelled";

export interface QueueItem {
  _id: string;
  branchId: string;
  partyName: string;
  contactInfo: string;
  partySize: number;
  requestedAt: string;
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewQueueInput {
  branchId: string;
  partyName: string;
  contactInfo: string;
  partySize: number;
  requestedAt: string;
}

export interface QueueListResponse {
  queue: QueueItem[];
}

export interface QueueResponse {
  queueItem: QueueItem;
}
