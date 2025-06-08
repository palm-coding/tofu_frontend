"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Coffee, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// นำเข้า interfaces ที่จำเป็น
import type { TableDisplay } from "@/interfaces/table.interface";
import { QueueItem, NewQueueInput } from "@/interfaces/queue.interface";
import { Branch } from "@/interfaces/branch.interface";
import { Session } from "@/interfaces/session.interface";

// นำเข้า helper functions จากไฟล์ที่แยกออกมา
import {
  getTimeAgo,
  getStatusText,
  getStatusColor,
  calculateTableTotal,
  getTableCardStyle,
  getStatusBadgeStyle,
} from "./utils/table-helper";

// นำเข้า services ที่จำเป็น
import {
  tableService,
  queueService,
  sessionService,
  orderService,
} from "@/services/table.service";

// นำเข้า components
import { TableQrCodeDialog } from "./dialogs/table-qrcode-dialog";
import { TableDetailDialog } from "./dialogs/table-detail-dialog";
import { TableManagement } from "./tabs/table-management";
import { QueueManagement } from "./tabs/queue-management";

interface TableManagementProps {
  branchCode: string;
  branchId?: string;
  branch?: Branch | null;
}

export function TableDisplay({ branchId }: TableManagementProps) {
  console.log("[Table] branchId:", branchId);

  // State for data
  const [tables, setTables] = useState<TableDisplay[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableDisplay | null>(null);
  // เพิ่ม state เก็บข้อมูล session
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // UI state
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [queueDialogOpen, setQueueDialogOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [activeTab, setActiveTab] = useState("tables");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Queue form state
  const [newQueue, setNewQueue] = useState<NewQueueInput>({
    customerName: "",
    phoneNumber: "",
    partySize: "",
    checkinTime: "",
  });

  // Load tables and queue data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!branchId) {
          setError("Branch ID is required");
          setLoading(false);
          return;
        }

        // Fetch tables data
        const tablesResponse = await tableService.getTables(branchId);
        setTables(tablesResponse.tables);

        // Fetch queue data
        const queueResponse = await queueService.getQueue(branchId);
        setQueue(queueResponse.queue);
      } catch (err) {
        console.error("Error loading table data:", err);
        setError("ไม่สามารถโหลดข้อมูลโต๊ะและคิวได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  // สร้างฟังก์ชันสำหรับกำหนด qrCode โดยเฉพาะ ไม่ต้องรอ session
  const generateTableQRCode = (tableId: string) => {
    const timestamp = Date.now();
    const randomCode = Math.random().toString(36).substring(2, 10);
    return `table_${tableId}_${timestamp}_${randomCode}`;
  };

  // เช็คอินโต๊ะ - เพิ่มการตรวจสอบ session ที่สร้างขึ้น
  const handleCheckin = async (tableId: string) => {
    try {
      setError(null);

      if (!branchId) {
        setError("Branch ID is required");
        return;
      }

      // สร้าง QR Code ก่อน
      const generatedQRCode = generateTableQRCode(tableId);

      // 1. อัพเดทสถานะโต๊ะเป็น occupied
      await tableService.updateTable(tableId, { status: "occupied" });

      // 2. สร้าง session ใหม่โดยไม่มีข้อมูล member
      const sessionData = {
        branchId,
        tableId,
        qrCode: generatedQRCode, // ส่ง qrCode ที่สร้างไปด้วย
        // ไม่มี member - ลูกค้าจะ join เองเมื่อสแกน QR
      };

      console.log(
        "สร้าง session ด้วยข้อมูล:",
        JSON.stringify(sessionData, null, 2)
      );
      const sessionResponse = await sessionService.createSession(sessionData);
      console.log(
        "Session ที่สร้างขึ้น:",
        JSON.stringify(sessionResponse, null, 2)
      );

      // แก้ไขการตรวจสอบโครงสร้างข้อมูล session - รองรับทั้งสองรูปแบบ
      if (sessionResponse) {
        // กรณี response แบบ { session: {...} }
        setSelectedSession(sessionResponse);
      } else {
        console.warn("Session response ไม่มีข้อมูล session ที่ถูกต้อง");
      }

      // ดึงข้อมูลโต๊ะล่าสุด
      const tableResponse = await tableService.getTableById(branchId, tableId);
      setSelectedTable(tableResponse.table);

      // อัพเดทรายการโต๊ะ
      setTables(
        tables.map((table) =>
          table._id === tableId ? tableResponse.table : table
        )
      );

      // แสดง QR Code สำหรับให้ลูกค้าสแกน
      setQrDialogOpen(true);
    } catch (err) {
      console.error("Error checking in table:", err);
      setError("ไม่สามารถเช็คอินโต๊ะได้ กรุณาลองอีกครั้ง");
    }
  };

  // เช็คเอาท์โต๊ะ - แก้ไขเพื่อใช้ sessionService และตรวจสอบสถานะออร์เดอร์
  const handleCheckout = async (tableId: string) => {
    try {
      setError(null);

      if (!branchId) {
        setError("Branch ID is required");
        return;
      }

      // 1. ค้นหา active session ของโต๊ะนี้
      try {
        const sessionResponse = await sessionService.getActiveSessionForTable(
          tableId
        );
        if (sessionResponse) {
          // 1.1 ตรวจสอบออร์เดอร์ที่ยังไม่ได้เสิร์ฟในเซสชัน
          const orders = await orderService.getOrdersForSession(
            sessionResponse._id
          );
          const nonServedOrders = orders.filter(
            (order) => order.status !== "served"
          );

          // 1.2 อัพเดทสถานะออร์เดอร์ทั้งหมดที่ยังไม่ได้เสิร์ฟเป็น "served"
          if (nonServedOrders.length > 0) {
            console.log(
              `Found ${nonServedOrders.length} non-served orders, updating status...`
            );

            // อัพเดทสถานะทีละออร์เดอร์
            for (const order of nonServedOrders) {
              await orderService.updateOrderStatus(order._id, "served");
              console.log(`Updated order ${order._id} status to "served"`);
            }
          }

          // 2. เช็คเอาท์ session
          await sessionService.checkoutSession(sessionResponse._id);
        }

        // 3. อัพเดตสถานะโต๊ะเป็น available
        await tableService.updateTable(tableId, { status: "available" });

        // 4. อัพเดต tables state
        setTables(
          tables.map((table) =>
            table._id === tableId
              ? {
                  ...table,
                  status: "available",
                  checkinTime: undefined,
                  customerName: undefined,
                  sessionId: undefined,
                  orders: undefined,
                }
              : table
          )
        );

        // 5. รีเซ็ตข้อมูลที่เลือกอยู่
        if (selectedTable?._id === tableId) {
          setSelectedTable(null);
          setSelectedSession(null);
        }

        setDetailsDialogOpen(false);
      } catch (sessionError) {
        console.warn("No active session found:", sessionError);
      }
    } catch (err) {
      console.error("Failed to checkout table:", err);
      setError("ไม่สามารถเช็คเอาท์โต๊ะได้ กรุณาลองอีกครั้ง");
    }
  };

  // เปิดรายละเอียดโต๊ะ - เพิ่มการดึงข้อมูล session
  const handleOpenDetails = async (table: TableDisplay) => {
    console.log("Opening details for table:", JSON.stringify(table, null, 2));
    try {
      setSelectedTable(table);
      setDetailsDialogOpen(true);
      setIsPaid(false);

      if (table._id && table.status === "occupied") {
        // หากไม่มี sessionId แต่โต๊ะอยู่ในสถานะไม่ว่าง ลองดึงข้อมูล active session
        try {
          const sessionResponse = await sessionService.getActiveSessionForTable(
            table._id
          );
          console.log(
            "Session response:",
            JSON.stringify(sessionResponse, null, 2)
          );
          if (sessionResponse) {
            setSelectedSession(sessionResponse);
          } else {
            console.error("No active session found for this table");
          }
        } catch (err) {
          console.error("Error fetching active session:", err);
        }
      }
    } catch (err) {
      console.error("Error opening table details:", err);
      setError("ไม่สามารถเปิดรายละเอียดโต๊ะได้ กรุณาลองอีกครั้ง");
    }
  };

  // แสดง QR Code - แก้ไขเพื่อให้ปุ่มทำงานได้เสมอ
  const handleShowQR = async (table: TableDisplay) => {
    console.log("Showing QR code for table:", JSON.stringify(table, null, 2));
    try {
      setSelectedTable(table);

      // กรณีโต๊ะว่าง ให้แสดง QR เพื่อเช็คอินได้เลย
      if (table.status === "available") {
        // กรณีโต๊ะว่าง ใช้การสร้าง QR Code ชั่วคราวเพื่อให้แสดงได้
        const tempQRCode = generateTableQRCode(table._id);
        setSelectedSession({
          _id: `temp_${Date.now()}`,
          branchId: branchId || "",
          tableId: table._id,
          qrCode: tempQRCode,
          members: [],
          checkinAt: new Date().toISOString(),
          orderIds: [],
        });
        setQrDialogOpen(true);
        return;
      }

      // กรณีโต๊ะไม่ว่าง พยายามดึงข้อมูล session
      if (table._id) {
        try {
          const sessionResponse = await sessionService.getActiveSessionForTable(
            table._id
          );
          console.log("Session response:", sessionResponse);

          if (sessionResponse) {
            // พบ session
            setSelectedSession(sessionResponse);

            // แม้ไม่มี qrCode ใน session ก็สร้างขึ้นใหม่
            if (!sessionResponse.qrCode) {
              console.warn("ไม่พบ QR Code ในเซสชัน - สร้างชั่วคราว");
              const tempCode = generateTableQRCode(table._id);
              setSelectedSession({
                ...sessionResponse,
                qrCode: tempCode,
              });
            }

            // แสดง dialog เสมอ
            setQrDialogOpen(true);
          } else {
            console.error("No active session found for this table");
          }
        } catch (err) {
          // เกิดข้อผิดพลาดในการดึงข้อมูล session แต่ยังคงแสดง QR Code
          console.error("Error fetching active session:", err);
        }
      }
    } catch (err) {
      console.error("Error showing QR code:", err);
      // แสดงข้อผิดพลาดแต่ยังคงแสดง QR Code
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล QR Code");
    }
  };

  // ฟังก์ชันเกี่ยวกับคิว - ไม่ต้องแก้ไข
  const handleAddQueue = async () => {
    if (!newQueue.customerName || !newQueue.partySize || !newQueue.checkinTime)
      return;

    try {
      setError(null);

      if (!branchId) {
        setError("Branch ID is required");
        return;
      }

      const response = await queueService.addToQueue(branchId, newQueue);
      setQueue([...queue, response.queueItem]);

      setNewQueue({
        customerName: "",
        phoneNumber: "",
        partySize: "",
        checkinTime: "",
      });

      setQueueDialogOpen(false);
    } catch (err) {
      console.error("Error adding to queue:", err);
      setError("ไม่สามารถเพิ่มคิวได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleSeatQueue = async (queueId: string) => {
    try {
      setError(null);

      if (!branchId) {
        setError("Branch ID is required");
        return;
      }

      const response = await queueService.updateQueueStatus(
        branchId,
        queueId,
        "seated"
      );
      setQueue(
        queue.map((item) => (item._id === queueId ? response.queueItem : item))
      );
    } catch (err) {
      console.error("Error updating queue status:", err);
      setError("ไม่สามารถอัพเดทสถานะคิวได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleCancelQueue = async (queueId: string) => {
    try {
      setError(null);

      if (!branchId) {
        setError("Branch ID is required");
        return;
      }

      await queueService.removeFromQueue(branchId, queueId);
      setQueue(queue.filter((item) => item._id !== queueId));
    } catch (err) {
      console.error("Error removing from queue:", err);
      setError("ไม่สามารถลบคิวได้ กรุณาลองอีกครั้ง");
    }
  };

  // บันทึกการชำระเงิน - แก้ไขเพื่อใช้งานกับ session
  const handleMarkAsPaid = async () => {
    if (!selectedTable || !selectedSession) return;

    try {
      setError(null);

      if (!branchId) {
        setError("Branch ID is required");
        return;
      }

      // 1. ดึงรายการออร์เดอร์ในเซสชัน
      const orders = await orderService.getOrdersForSession(
        selectedSession._id
      );

      // 2. อัพเดตสถานะออร์เดอร์ทั้งหมดเป็นชำระเงินแล้ว
      for (const order of orders) {
        await orderService.updateOrderStatus(order._id, "paid");
      }

      // 3. ดึงข้อมูลโต๊ะล่าสุด
      const updatedTableResponse = await tableService.getTableById(
        branchId,
        selectedTable._id
      );

      // 4. อัพเดต state
      setSelectedTable(updatedTableResponse.table);
      setIsPaid(true);

      // 5. อัพเดตรายการโต๊ะในหน้าจอ
      setTables(
        tables.map((table) =>
          table._id === selectedTable._id ? updatedTableResponse.table : table
        )
      );
    } catch (err) {
      console.error("Error marking table as paid:", err);
      setError("ไม่สามารถบันทึกการชำระเงินได้ กรุณาลองอีกครั้ง");
    }
  };

  // แก้ไขฟังก์ชัน getOrderUrl เพื่อใช้งาน qrCode จาก session
  const getOrderUrl = () => {
    // ใช้ origin ของเว็บปัจจุบัน (ปรับตามสภาพแวดล้อมจริง)
    const origin = "http://localhost:3001";

    // กรณีที่มี session และมี qrCode - กรณีหลักที่ใช้งาน
    if (selectedSession?.qrCode) {
      return `${origin}/order/${selectedSession.qrCode}`;
    }
    // กรณีไม่มีข้อมูลใดๆ
    return `${origin}/order`;
  };

  // ฟังก์ชันช่วยเหลือต่างๆ - ย้ายไปไฟล์ tableHelpers.ts แล้ว

  // แสดงสถานะ loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-lg text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-3">
            <h1 className="text-4xl font-light tracking-tight text-foreground">
              จัดการโต๊ะและคิว
            </h1>
            <p className="text-muted-foreground text-lg">
              จัดการโต๊ะ สร้าง QR Code และจัดการคิวลูกค้า
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-card shadow-lg">
              <TabsTrigger
                value="tables"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Coffee className="mr-2 h-4 w-4" />
                จัดการโต๊ะ
              </TabsTrigger>
              <TabsTrigger
                value="queue"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Clock className="mr-2 h-4 w-4" />
                จัดการคิว
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="space-y-6">
              <TableManagement
                tables={tables}
                handleCheckin={handleCheckin}
                handleOpenDetails={handleOpenDetails}
                handleShowQR={handleShowQR}
                getTableCardStyle={getTableCardStyle}
                getStatusBadgeStyle={getStatusBadgeStyle}
                getStatusText={getStatusText}
                calculateTableTotal={calculateTableTotal}
              />
            </TabsContent>

            <TabsContent value="queue" className="space-y-6">
              <QueueManagement
                queue={queue}
                queueDialogOpen={queueDialogOpen}
                setQueueDialogOpen={setQueueDialogOpen}
                newQueue={newQueue}
                setNewQueue={setNewQueue}
                handleAddQueue={handleAddQueue}
                handleSeatQueue={handleSeatQueue}
                handleCancelQueue={handleCancelQueue}
                getStatusBadgeStyle={getStatusBadgeStyle}
                getStatusText={getStatusText}
                getTimeAgo={getTimeAgo}
              />
            </TabsContent>
          </Tabs>

          {/* QR Code Dialog - แก้ไข props */}
          <TableQrCodeDialog
            open={qrDialogOpen}
            onOpenChange={setQrDialogOpen}
            selectedTable={selectedTable}
            getOrderUrl={getOrderUrl}
            qrCode={selectedSession?.qrCode}
          />

          {/* Table Details Dialog - เพิ่ม props session */}
          <TableDetailDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            selectedTable={selectedTable}
            session={selectedSession}
            isPaid={isPaid}
            onMarkAsPaid={handleMarkAsPaid}
            onCheckout={handleCheckout}
            onShowQR={handleShowQR}
            getTimeAgo={getTimeAgo}
            getStatusText={getStatusText}
            getStatusColor={getStatusColor}
            calculateTableTotal={calculateTableTotal}
          />
        </div>
      </div>
    </div>
  );
}
