"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Coffee, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TableItem,
  QueueItem,
  NewQueueInput,
} from "@/interfaces/table.interface";
import { tableService } from "@/services/table.service";
import { TableQrCodeDialog } from "./dialogs/table-qrcode-dialog";
import { TableDetailDialog } from "./dialogs/table-detail-dialog";
import { TableManagement } from "./tabs/table-management";
import { QueueManagement } from "./tabs/queue-management";

interface TableManagementProps {
  branchId: string;
}

export function TableDisplay({ branchId }: TableManagementProps) {
  // State for data
  const [tables, setTables] = useState<TableItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

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

        // Fetch tables data
        const tablesResponse = await tableService.getTables(branchId);
        setTables(tablesResponse.tables);

        // Fetch queue data
        const queueResponse = await tableService.getQueue(branchId);
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

  // Generate a unique session ID for QR code
  const generateSessionId = () => {
    return `${branchId}_${selectedTable?.id}_${Date.now()}`;
  };

  const handleCheckin = async (tableId: string) => {
    try {
      setError(null);
      const response = await tableService.tableCheckin(branchId, tableId);

      // Update tables state
      setTables(
        tables.map((table) => (table.id === tableId ? response.table : table))
      );

      setSelectedTable(response.table);
      setQrDialogOpen(true);
    } catch (err) {
      console.error("Error checking in table:", err);
      setError("ไม่สามารถเช็คอินโต๊ะได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleCheckout = async (tableId: string) => {
    try {
      setError(null);
      await tableService.tableCheckout(branchId, tableId);

      // Update tables state
      setTables(
        tables.map((table) =>
          table.id === tableId
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

      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }
      setDetailsDialogOpen(false);
      setIsPaid(false);
    } catch (err) {
      console.error("Error checking out table:", err);
      setError("ไม่สามารถเช็คเอาท์โต๊ะได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleOpenDetails = (table: TableItem) => {
    setSelectedTable(table);
    setDetailsDialogOpen(true);
    setIsPaid(false);
  };

  const handleShowQR = (table: TableItem) => {
    setSelectedTable(table);
    setQrDialogOpen(true);
  };

  const handleAddQueue = async () => {
    if (!newQueue.customerName || !newQueue.partySize || !newQueue.checkinTime)
      return;

    try {
      setError(null);
      const response = await tableService.addToQueue(branchId, newQueue);

      // Update queue state
      setQueue([...queue, response.queueItem]);

      // Reset form
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
      const response = await tableService.updateQueueStatus(
        branchId,
        queueId,
        "seated"
      );

      // Update queue state
      setQueue(
        queue.map((item) => (item.id === queueId ? response.queueItem : item))
      );
    } catch (err) {
      console.error("Error updating queue status:", err);
      setError("ไม่สามารถอัพเดทสถานะคิวได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleCancelQueue = async (queueId: string) => {
    try {
      setError(null);
      await tableService.removeFromQueue(branchId, queueId);

      // Update queue state
      setQueue(queue.filter((item) => item.id !== queueId));
    } catch (err) {
      console.error("Error removing from queue:", err);
      setError("ไม่สามารถลบคิวได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedTable) return;

    try {
      setError(null);
      await tableService.markTableAsPaid(branchId, selectedTable.id);
      setIsPaid(true);
    } catch (err) {
      console.error("Error marking table as paid:", err);
      setError("ไม่สามารถบันทึกการชำระเงินได้ กรุณาลองอีกครั้ง");
    }
  };

  const getOrderUrl = (sessionId: string) => {
    // In a real app, this would be your actual domain
    return `https://tofupos.com/order/${sessionId}`;
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "เมื่อสักครู่";
      if (diffMins === 1) return "1 นาทีที่แล้ว";
      return `${diffMins} นาทีที่แล้ว`;
    } catch (error) {
      console.error("Error parsing date:", error);
      return "ไม่ทราบเวลา";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "ว่าง";
      case "occupied":
        return "ไม่ว่าง";
      case "waiting":
        return "รอคิว";
      case "seated":
        return "นั่งแล้ว";
      case "pending":
        return "รอรับออร์เดอร์";
      case "preparing":
        return "กำลังทำ";
      case "served":
        return "เสิร์ฟแล้ว";
      default:
        return "ไม่ทราบ";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "preparing":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "served":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "waiting":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "seated":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "";
    }
  };

  const calculateTableTotal = (table: TableItem | null) => {
    if (!table || !table.orders || table.orders.length === 0) return 0;
    return table.orders.reduce((total, order) => total + (order.total || 0), 0);
  };

  const getTableCardStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-card border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600";
      case "occupied":
        return "bg-red-50 dark:bg-accent/20 border-2 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600";
      default:
        return "bg-card border-2 border-border";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-100 border-green-200 dark:border-green-700";
      case "occupied":
        return "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-100 border-red-200 dark:border-red-700";
      case "waiting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700";
      case "seated":
        return "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-100 border-green-200 dark:border-green-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Show loading state
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

          {/* QR Code Dialog */}
          <TableQrCodeDialog
            open={qrDialogOpen}
            onOpenChange={setQrDialogOpen}
            selectedTable={selectedTable}
            getOrderUrl={getOrderUrl}
            generateSessionId={generateSessionId}
          />

          {/* Table Details Dialog */}
          <TableDetailDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            selectedTable={selectedTable}
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
