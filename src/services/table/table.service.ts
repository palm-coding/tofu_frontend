import { api } from "../api.service";
import {
  Table,
  TableDisplay,
  TableListResponse,
  TableResponse,
} from "@/interfaces/table.interface";
import { Order } from "@/interfaces/order.interface";
import { CreateSessionRequest } from "@/interfaces/session.interface";

// Helper function ที่แปลงข้อมูลจาก API เป็น TableDisplay
const processTableData = async (table: Table): Promise<TableDisplay> => {
  try {
    // ดึงข้อมูล active session สำหรับโต๊ะนี้
    const sessionResponse = await api.get(
      `/sessions/table/${table._id}/active`
    );

    if (!sessionResponse.data || !sessionResponse.data.session) {
      // ถ้าไม่มี active session ให้ส่งคืนเฉพาะข้อมูลโต๊ะ
      return { ...table };
    }

    const session = sessionResponse.data.session;

    // ดึงข้อมูล orders สำหรับ session นี้
    const ordersResponse = await api.get(`/orders/session/${session._id}`);
    const orders = ordersResponse.data.orders || [];

    // แปลงรูปแบบข้อมูล orders ให้ตรงกับที่ UI ต้องการ
    const processedOrders = orders.map((order: Order) => ({
      _id: order._id,
      status: order.status,
      createdAt: order.createdAt,
      orderLines: order.orderLines,
      totalAmount: order.totalAmount,
    }));

    // รองรับทั้งแบบเก่า (userLabel) และแบบใหม่ (members)
    const customerName =
      session.members && session.members.length > 0
        ? session.members.map((m: {userLabel: string}) => m.userLabel).join(", ")
        : session.userLabel || "ลูกค้า";

    // สร้าง TableDisplay object ที่มีข้อมูลครบถ้วน
    return {
      ...table,
      sessionId: session._id,
      checkinTime: new Date(session.checkinAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      customerName,
      orders: processedOrders,
    };
  } catch (error) {
    console.error(`Error processing table data for table ${table._id}:`, error);
    // ถ้าเกิดข้อผิดพลาดในการดึงข้อมูลเพิ่มเติม ส่งคืนเฉพาะข้อมูลโต๊ะ
    return { ...table };
  }
};

export const tableService = {
  // GET /tables
  getAllTables: async (): Promise<TableListResponse> => {
    try {
      const response = await api.get("/tables");
      const tablesData = Array.isArray(response.data)
        ? response.data
        : response.data.tables || [];

      const processedTablePromises = tablesData.map(processTableData);
      const tables = await Promise.all(processedTablePromises);

      return { tables };
    } catch (error) {
      console.error("Failed to fetch all tables:", error);
      throw error;
    }
  },

  // GET /tables/branch/:branchId
  getTables: async (branchId: string): Promise<TableListResponse> => {
    try {
      const response = await api.get(`/tables/branch/${branchId}`);

      const tablesData = Array.isArray(response.data)
        ? response.data
        : response.data.tables || [];

      if (!tablesData || !Array.isArray(tablesData)) {
        console.error("Invalid response format from API:", response.data);
        throw new Error("Invalid response format from API");
      }

      const processedTablePromises = tablesData.map(processTableData);
      const tables = await Promise.all(processedTablePromises);

      return { tables };
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      throw error;
    }
  },

  // GET /tables/:id
  getTableById: async (
    branchId: string,
    tableId: string
  ): Promise<TableResponse> => {
    try {
      const response = await api.get(`/tables/${tableId}`);
      const table = response.data.table || response.data;

      if (!table) {
        throw new Error("Table not found");
      }

      const tableWithSessionData = await processTableData(table);
      return { table: tableWithSessionData };
    } catch (error) {
      console.error("Failed to fetch table details:", error);
      throw error;
    }
  },

  // POST /tables
  createTable: async (
    branchId: string,
    tableData: Partial<Table>
  ): Promise<TableResponse> => {
    try {
      const response = await api.post("/tables", {
        ...tableData,
        branchId,
      });

      const table = response.data.table || response.data;
      return { table };
    } catch (error) {
      console.error("Failed to create table:", error);
      throw error;
    }
  },

  // PATCH /tables/:id
  updateTable: async (
    tableId: string,
    tableData: Partial<Table>
  ): Promise<TableResponse> => {
    try {
      const response = await api.patch(`/tables/${tableId}`, tableData);
      const table = response.data.table || response.data;

      const tableWithSessionData = await processTableData(table);
      return { table: tableWithSessionData };
    } catch (error) {
      console.error("Failed to update table:", error);
      throw error;
    }
  },

  // DELETE /tables/:id
  deleteTable: async (tableId: string): Promise<void> => {
    try {
      await api.delete(`/tables/${tableId}`);
    } catch (error) {
      console.error("Failed to delete table:", error);
      throw error;
    }
  },

  // Utility methods for table management
  tableCheckin: async (
    branchId: string,
    tableId: string,
    clientId: string = `pos_${Date.now()}`,
    userLabel: string = "ลูกค้า"
  ): Promise<TableResponse> => {
    try {
      // 1. อัพเดทสถานะโต๊ะเป็น occupied
      const tableResponse = await api.patch(`/tables/${tableId}`, {
        status: "occupied",
      });

      // 2. สร้าง session ใหม่ด้วยโครงสร้างใหม่
      const sessionData: CreateSessionRequest = {
        branchId,
        tableId,
        member: {
          clientId,
          userLabel,
        },
      };

      await api.post(`/sessions`, sessionData);

      // 3. ดึงข้อมูลโต๊ะล่าสุดที่มี session ข้อมูล
      const updatedTable = tableResponse.data.table || tableResponse.data;
      const tableWithSessionData = await processTableData(updatedTable);

      return { table: tableWithSessionData };
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
      let sessionFound = false;

      try {
        // 1. หา active session ของโต๊ะนี้
        const sessionResponse = await api.get(
          `/sessions/table/${tableId}/active`
        );

        if (sessionResponse.data && sessionResponse.data.session) {
          const session = sessionResponse.data.session;

          // 2. เช็คเอาท์ session (เฉพาะถ้ามี session)
          await api.post(`/sessions/${session._id}/checkout`);
          sessionFound = true;
        }
      } catch (sessionError) {
        console.warn(
          "No active session found, will only update table status:",
          sessionError
        );
        // ไม่ต้อง throw error แต่ log เป็น warning
      }

      // 3. อัพเดทสถานะโต๊ะเป็น available (ทำเสมอแม้ไม่พบ session)
      const tableResponse = await api.patch(`/tables/${tableId}`, {
        status: "available",
      });

      // 4. ดึงข้อมูลโต๊ะล่าสุด
      const updatedTable = tableResponse.data.table || tableResponse.data;

      if (!sessionFound) {
        console.info(
          `Table ${tableId} status updated to available, but no active session was found`
        );
      }

      return { table: { ...updatedTable } };
    } catch (error) {
      console.error("Failed to check out table:", error);
      throw error;
    }
  },

  markTableAsPaid: async (
    branchId: string,
    tableId: string
  ): Promise<TableResponse> => {
    try {
      // 1. หา active session ของโต๊ะนี้
      const sessionResponse = await api.get(
        `/sessions/table/${tableId}/active`
      );
      if (!sessionResponse.data || !sessionResponse.data.session) {
        throw new Error("No active session found for this table");
      }
      const session = sessionResponse.data.session;

      // 2. ดึงข้อมูลออร์เดอร์ทั้งหมดของ session นี้
      const ordersResponse = await api.get(`/orders/session/${session._id}`);
      const orders = ordersResponse.data.orders || [];

      // 3. อัพเดทสถานะการชำระเงินของทุกออร์เดอร์
      for (const order of orders) {
        await api.patch(`/orders/${order._id}/status`, {
          status: "paid",
        });
      }

      // 4. ดึงข้อมูลโต๊ะล่าสุดที่มีการอัพเดท
      const tableResponse = await api.get(`/tables/${tableId}`);
      const table = tableResponse.data.table || tableResponse.data;

      // 5. ประมวลผลข้อมูลโต๊ะ
      const tableWithSessionData = await processTableData(table);

      return { table: tableWithSessionData };
    } catch (error) {
      console.error("Failed to mark table as paid:", error);
      throw error;
    }
  },
};
