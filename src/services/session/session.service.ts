import { api } from "../api.service";
import {
  Session,
  SessionResponse,
  CreateSessionRequest,
  JoinSessionRequest,
} from "@/interfaces/session.interface";

export const sessionService = {
  // POST /sessions - สร้างเซสชันใหม่ (Check-in)
  createSession: async (
    data: CreateSessionRequest
  ): Promise<SessionResponse> => {
    try {
      const response = await api.post("/sessions", data);
      return response.data;
    } catch (error) {
      console.error("Failed to create session:", error);
      throw error;
    }
  },

  // POST /sessions/join/:qrCode - เข้าร่วมเซสชันด้วย QR Code
  joinSession: async (
    qrCode: string,
    data: JoinSessionRequest
  ): Promise<SessionResponse> => {
    try {
      const response = await api.post(`/sessions/join/${qrCode}`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to join session:", error);
      throw error;
    }
  },

  // GET /sessions
  getSessions: async (activeOnly: boolean = false): Promise<Session[]> => {
    try {
      const response = await api.get(
        `/sessions${activeOnly ? "?activeOnly=true" : ""}`
      );
      return response.data.sessions || [];
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      throw error;
    }
  },

  // GET /sessions/branch/:branchId
  getSessionsForBranch: async (branchId: string): Promise<Session[]> => {
    try {
      const response = await api.get(`/sessions/branch/${branchId}`);
      return response.data.sessions || [];
    } catch (error) {
      console.error("Failed to fetch branch sessions:", error);
      throw error;
    }
  },

  // GET /sessions/table/:tableId
  getSessionsForTable: async (tableId: string): Promise<Session[]> => {
    try {
      const response = await api.get(`/sessions/table/${tableId}`);
      return response.data.sessions || [];
    } catch (error) {
      console.error("Failed to fetch table sessions:", error);
      throw error;
    }
  },

  // GET /sessions/qr/:qrCode
  getSessionsForQrCode: async (qrCode: string): Promise<Session[]> => {
    console.log("Fetching sessions for QR code:", qrCode);
    try {
      const response = await api.get(`/sessions/qr/${qrCode}`);

      // ตรวจสอบรูปแบบข้อมูลที่ได้รับกลับมา
      console.log("API response data format:", response.data);

      // เปลี่ยนการจัดการข้อมูลให้รองรับทั้งกรณีที่เป็น object เดี่ยวและ array
      if (response.data) {
        if (Array.isArray(response.data.sessions)) {
          // กรณีที่ API ส่งกลับเป็น { sessions: [...] }
          return response.data.sessions;
        } else if (Array.isArray(response.data)) {
          // กรณีที่ API ส่งกลับเป็น array โดยตรง
          return response.data;
        } else if (response.data._id) {
          // กรณีที่ API ส่งกลับเป็น object เดี่ยว (session object)
          return [response.data];
        } else if (response.data.session && response.data.session._id) {
          // กรณีที่ API ส่งกลับเป็น { session: {...} }
          return [response.data.session];
        }
      }

      // กรณีไม่พบข้อมูลที่เข้าเงื่อนไขใดๆ
      console.warn("Unexpected response format:", response.data);
      return [];
    } catch (error) {
      console.error("Failed to fetch sessions for QR code:", error);
      throw error;
    }
  },

  // GET /sessions/table/:tableId/active
  getActiveSessionForTable: async (
    tableId: string
  ): Promise<SessionResponse> => {
    try {
      const response = await api.get(`/sessions/table/${tableId}/active`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch active session for table:", error);
      throw error;
    }
  },

  // GET /sessions/:id
  getSessionById: async (sessionId: string): Promise<SessionResponse> => {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch session:", error);
      throw error;
    }
  },

  // PATCH /sessions/:id
  updateSession: async (
    sessionId: string,
    sessionData: Partial<Session>
  ): Promise<SessionResponse> => {
    try {
      const response = await api.patch(`/sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      console.error("Failed to update session:", error);
      throw error;
    }
  },

  // POST /sessions/:id/orders/:orderId
  addOrderToSession: async (
    sessionId: string,
    orderId: string
  ): Promise<SessionResponse> => {
    try {
      const response = await api.post(
        `/sessions/${sessionId}/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to add order to session:", error);
      throw error;
    }
  },

  // POST /sessions/:id/checkout
  checkoutSession: async (sessionId: string): Promise<SessionResponse> => {
    try {
      const response = await api.post(`/sessions/${sessionId}/checkout`);
      return response.data;
    } catch (error) {
      console.error("Failed to checkout session:", error);
      throw error;
    }
  },

  // DELETE /sessions/:id
  deleteSession: async (sessionId: string): Promise<void> => {
    try {
      await api.delete(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("Failed to delete session:", error);
      throw error;
    }
  },
};
