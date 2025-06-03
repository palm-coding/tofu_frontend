import { io, Socket } from "socket.io-client";
import {
  SocketResponse,
  NewOrderEvent,
  OrderStatusChangedEvent,
} from "@/interfaces/websocket.interface";
import { Order } from "@/interfaces/order.interface";

// กำหนดประเภทข้อมูลที่อาจได้รับจาก event ต่างๆ
type EventData =
  | NewOrderEvent
  | OrderStatusChangedEvent
  | Order
  | Error
  | string
  | number
  | boolean
  | null
  | undefined;
  

// แก้ไขจาก any เป็น unknown หรือ union type ที่เฉพาะเจาะจง
type EventHandler = (...args: EventData[]) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private apiUrl: string;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Record<string, EventHandler[]> = {};

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  /**
   * เชื่อมต่อกับ WebSocket server
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.connect();
      return this.socket;
    }

    this.socket = io(`${this.apiUrl}/orders`, {
      reconnectionAttempts: this.maxConnectionAttempts,
      reconnectionDelay: this.reconnectDelay,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected successfully");
      this.connectionAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      this.connectionAttempts++;
      console.error(
        `WebSocket connection error (${this.connectionAttempts}/${this.maxConnectionAttempts}):`,
        error
      );
    });

    return this.socket;
  }

  /**
   * เข้าร่วม room ของสาขา
   */
  joinBranchRoom(branchId: string): Promise<SocketResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        this.connect();
      }

      this.socket?.emit(
        "joinBranchRoom",
        branchId,
        (response: SocketResponse) => {
          if (response.success) {
            console.log("Joined branch room:", branchId);
            resolve(response);
          } else {
            console.error("Failed to join branch room:", response);
            reject(response);
          }
        }
      );
    });
  }

  /**
   * ออกจาก room ของสาขา
   */
  leaveBranchRoom(branchId: string): Promise<SocketResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        resolve({ success: false, message: "Not connected" });
        return;
      }

      this.socket.emit(
        "leaveBranchRoom",
        branchId,
        (response: SocketResponse) => {
          if (response.success) {
            console.log("Left branch room:", branchId);
            resolve(response);
          } else {
            console.error("Failed to leave branch room:", response);
            reject(response);
          }
        }
      );
    });
  }

  /**
   * ลงทะเบียน event listener
   */
  on(event: string, callback: EventHandler): () => void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }

    this.eventHandlers[event].push(callback);
    this.socket?.on(event, callback);

    // Return function to unsubscribe
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * ยกเลิกการลงทะเบียน event listener
   */
  off(event: string, callback: EventHandler): void {
    if (!this.eventHandlers[event]) return;

    const index = this.eventHandlers[event].indexOf(callback);
    if (index !== -1) {
      this.eventHandlers[event].splice(index, 1);
      this.socket?.off(event, callback);
    }
  }

  /**
   * ตัดการเชื่อมต่อ WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      // ลบทุก event listeners
      Object.keys(this.eventHandlers).forEach((event) => {
        this.eventHandlers[event].forEach((handler) => {
          this.socket?.off(event, handler);
        });
      });

      this.eventHandlers = {};
      this.socket.disconnect();
    }
  }

  /**
   * ตรวจสอบสถานะการเชื่อมต่อ
   */
  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

// Export เป็น singleton instance
export const webSocketService = new WebSocketService();
