"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import {
  Coffee,
  QrCode,
  ShoppingCart,
  Users,
  CreditCard,
  Receipt,
  Check,
  X,
  Eye,
  Plus,
  Clock,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface TableManagementProps {
  branchId: string;
}

// Mock tables data (removed reserved status)
const mockTables = [
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
const mockQueue = [
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

export function TableDisplay({ branchId }: TableManagementProps) {
  const [tables, setTables] = useState(mockTables);
  const [queue, setQueue] = useState(mockQueue);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [queueDialogOpen, setQueueDialogOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [activeTab, setActiveTab] = useState("tables");

  // Queue form state
  const [newQueue, setNewQueue] = useState({
    customerName: "",
    phoneNumber: "",
    partySize: "",
    checkinTime: "",
  });

  // Generate a unique session ID for QR code
  const generateSessionId = () => {
    return `${branchId}_${selectedTable?.id}_${Date.now()}`;
  };

  const handleCheckin = (tableId: string) => {
    // Find the table
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const sessionId = `${branchId}_${tableId}_${Date.now()}`;

    // Update table status
    const updatedTables = tables.map((table) => {
      if (table.id === tableId) {
        return {
          ...table,
          status: "occupied",
          checkinTime: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          customerName: "ลูกค้า",
          sessionId: sessionId,
          orders: [],
        };
      }
      return table;
    });

    setTables(updatedTables);
    setSelectedTable(updatedTables.find((t) => t.id === tableId));
    setQrDialogOpen(true);
  };

  const handleCheckout = (tableId: string) => {
    // Update table status
    const updatedTables = tables.map((table) => {
      if (table.id === tableId) {
        return {
          ...table,
          status: "available",
          checkinTime: undefined,
          customerName: undefined,
          sessionId: undefined,
          orders: undefined,
        };
      }
      return table;
    });

    setTables(updatedTables);
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
    setDetailsDialogOpen(false);
    setIsPaid(false);
  };

  const handleOpenDetails = (table: any) => {
    setSelectedTable(table);
    setDetailsDialogOpen(true);
    setIsPaid(false);
  };

  const handleShowQR = (table: any) => {
    setSelectedTable(table);
    setQrDialogOpen(true);
  };

  const handleAddQueue = () => {
    if (!newQueue.customerName || !newQueue.partySize || !newQueue.checkinTime)
      return;

    const queueItem = {
      id: `queue${Date.now()}`,
      customerName: newQueue.customerName,
      phoneNumber: newQueue.phoneNumber,
      partySize: Number.parseInt(newQueue.partySize),
      checkinTime: newQueue.checkinTime,
      status: "waiting",
      createdAt: new Date().toISOString(),
    };

    setQueue([...queue, queueItem]);
    setNewQueue({
      customerName: "",
      phoneNumber: "",
      partySize: "",
      checkinTime: "",
    });
    setQueueDialogOpen(false);
  };

  const handleSeatQueue = (queueId: string) => {
    const updatedQueue = queue.map((item) =>
      item.id === queueId ? { ...item, status: "seated" } : item
    );
    setQueue(updatedQueue);
  };

  const handleCancelQueue = (queueId: string) => {
    const updatedQueue = queue.filter((item) => item.id !== queueId);
    setQueue(updatedQueue);
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

  const calculateTableTotal = (table: any) => {
    if (!table || !table.orders || table.orders.length === 0) return 0;
    return table.orders.reduce(
      (total: number, order: any) => total + (order.total || 0),
      0
    );
  };

  const handleMarkAsPaid = () => {
    setIsPaid(true);
  };

  const getTableCardStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600";
      case "occupied":
        return "bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600";
      default:
        return "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-700";
      case "occupied":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200 dark:border-red-700";
      case "waiting":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700";
      case "seated":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-3">
            <h1 className="text-4xl font-light tracking-tight text-gray-900 dark:text-gray-100">
              จัดการโต๊ะและคิว
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              จัดการโต๊ะ สร้าง QR Code และจัดการคิวลูกค้า
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-gray-800 shadow-lg">
              <TabsTrigger
                value="tables"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900"
              >
                <Coffee className="mr-2 h-4 w-4" />
                จัดการโต๊ะ
              </TabsTrigger>
              <TabsTrigger
                value="queue"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-gray-100 dark:data-[state=active]:text-gray-900"
              >
                <Clock className="mr-2 h-4 w-4" />
                จัดการคิว
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                  <motion.div
                    key={table.id}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card
                      className={cn(
                        "group cursor-pointer transition-all duration-300 hover:shadow-xl shadow-lg animate-fade-in",
                        getTableCardStyle(table.status)
                      )}
                      onClick={() => setSelectedTable(table)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl font-light text-gray-900 dark:text-gray-100">
                            {table.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-0 font-medium",
                              getStatusBadgeStyle(table.status)
                            )}
                          >
                            {getStatusText(table.status)}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{table.capacity} ที่นั่ง</span>
                          </div>
                        </CardDescription>
                      </CardHeader>

                      {table.status === "occupied" && (
                        <CardContent className="pb-3 pt-0">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              ลูกค้า: {table.customerName || "ไม่ระบุ"}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              เช็คอิน: {table.checkinTime || "ไม่ระบุ"}
                            </p>
                            {table.orders && table.orders.length > 0 && (
                              <div className="mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                  ออร์เดอร์: {table.orders.length} รายการ
                                </p>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                  ยอดรวม: ฿{calculateTableTotal(table)}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}

                      <CardFooter className="pt-0">
                        {table.status === "available" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-green-300 text-green-700 hover:bg-green-600 hover:text-white dark:border-green-600 dark:text-green-400 dark:hover:bg-green-600 dark:hover:text-white transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckin(table.id);
                            }}
                          >
                            <Coffee className="mr-2 h-4 w-4" />
                            เช็คอิน
                          </Button>
                        ) : (
                          <div className="w-full flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-300 text-red-700 hover:bg-red-600 hover:text-white dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetails(table);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              รายละเอียด
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-600 hover:text-white dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowQR(table);
                              }}
                            >
                              <QrCode className="mr-2 h-4 w-4" />
                              QR Code
                            </Button>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="queue" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  คิวลูกค้า
                </h2>
                <Dialog
                  open={queueDialogOpen}
                  onOpenChange={setQueueDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900">
                      <Plus className="mr-2 h-4 w-4" />
                      เพิ่มคิว
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-light text-center">
                        เพิ่มคิวใหม่
                      </DialogTitle>
                      <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
                        กรอกข้อมูลลูกค้าที่ต้องการจองคิว
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-name">ชื่อลูกค้า *</Label>
                        <Input
                          id="customer-name"
                          placeholder="กรุณาระบุชื่อลูกค้า"
                          value={newQueue.customerName}
                          onChange={(e) =>
                            setNewQueue({
                              ...newQueue,
                              customerName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone-number">เบอร์โทรศัพท์</Label>
                        <Input
                          id="phone-number"
                          placeholder="081-234-5678"
                          value={newQueue.phoneNumber}
                          onChange={(e) =>
                            setNewQueue({
                              ...newQueue,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="party-size">จำนวนคน *</Label>
                        <Input
                          id="party-size"
                          type="number"
                          min="1"
                          placeholder="จำนวนคน"
                          value={newQueue.partySize}
                          onChange={(e) =>
                            setNewQueue({
                              ...newQueue,
                              partySize: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkin-time">เวลาเช็คอิน *</Label>
                        <Input
                          id="checkin-time"
                          type="time"
                          value={newQueue.checkinTime}
                          onChange={(e) =>
                            setNewQueue({
                              ...newQueue,
                              checkinTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setQueueDialogOpen(false)}
                        className="flex-1"
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        onClick={handleAddQueue}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
                      >
                        เพิ่มคิว
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {queue.map((queueItem) => (
                  <motion.div
                    key={queueItem.id}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="shadow-lg bg-white dark:bg-gray-800 border-0 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-light text-gray-900 dark:text-gray-100">
                            {queueItem.customerName}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-0 font-medium",
                              getStatusBadgeStyle(queueItem.status)
                            )}
                          >
                            {getStatusText(queueItem.status)}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          คิวเมื่อ: {getTimeAgo(queueItem.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-2">
                          {queueItem.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {queueItem.phoneNumber}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {queueItem.partySize} คน
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              เวลา: {queueItem.checkinTime}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        {queueItem.status === "waiting" ? (
                          <div className="w-full flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-green-300 text-green-700 hover:bg-green-600 hover:text-white"
                              onClick={() => handleSeatQueue(queueItem.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              นั่งแล้ว
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-600 hover:text-white"
                              onClick={() => handleCancelQueue(queueItem.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-600 hover:text-white"
                            onClick={() => handleCancelQueue(queueItem.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            ลบคิว
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {queue.length === 0 && (
                <div className="text-center py-16">
                  <Clock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    ยังไม่มีคิวลูกค้า
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* QR Code Dialog */}
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-light text-center">
                  QR Code สำหรับสั่งอาหาร
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
                  {selectedTable?.name} - ให้ลูกค้าสแกน QR Code
                  นี้เพื่อสั่งอาหาร
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <QRCodeSVG
                    value={getOrderUrl(
                      selectedTable?.sessionId || generateSessionId()
                    )}
                    size={200}
                    level="H"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
                <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400 max-w-xs break-all">
                  {getOrderUrl(selectedTable?.sessionId || generateSessionId())}
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setQrDialogOpen(false)}
                  className="w-full border-gray-300 hover:bg-gray-900 hover:text-white dark:border-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-all duration-300"
                >
                  <X className="mr-2 h-4 w-4" />
                  ปิด
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Table Details Dialog */}
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-light">
                  รายละเอียด {selectedTable?.name || "โต๊ะ"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  เช็คอินเมื่อ: {selectedTable?.checkinTime || "ไม่ระบุ"} |
                  ลูกค้า: {selectedTable?.customerName || "ไม่ระบุ"}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh] custom-scrollbar">
                <div className="p-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left side - Order details */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-light text-gray-900 dark:text-gray-100">
                        รายการอาหาร
                      </h3>
                      <div className="space-y-4">
                        {selectedTable?.orders &&
                        selectedTable.orders.length > 0 ? (
                          selectedTable.orders.map(
                            (order: any, index: number) => (
                              <div
                                key={order.id}
                                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-4"
                              >
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                    ออร์เดอร์ #{index + 1}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "border-0 font-medium",
                                      getStatusColor(order.status)
                                    )}
                                  >
                                    {getStatusText(order.status)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  สั่งเมื่อ: {getTimeAgo(order.createdAt)}
                                </p>

                                <div className="space-y-3">
                                  {order.items &&
                                    order.items.map((item: any) => (
                                      <div
                                        key={item.id}
                                        className="flex justify-between items-start py-2"
                                      >
                                        <div className="flex-1">
                                          <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {item.name}
                                          </span>
                                          <span className="text-sm text-gray-500 ml-2">
                                            x{item.quantity}
                                          </span>
                                          {item.note && (
                                            <p className="text-sm text-gray-500 mt-1">
                                              หมายเหตุ: {item.note}
                                            </p>
                                          )}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                          ฿
                                          {(item.price || 0) *
                                            (item.quantity || 0)}
                                        </span>
                                      </div>
                                    ))}
                                  <Separator className="my-3" />
                                  <div className="flex justify-between font-semibold text-lg">
                                    <span>รวม</span>
                                    <span>฿{order.total || 0}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="py-12 text-center">
                            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                              ยังไม่มีออร์เดอร์
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side - Payment and QR code */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-6">
                          สรุปรายการ
                        </h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              จำนวนออร์เดอร์:
                            </span>
                            <span className="font-medium">
                              {selectedTable?.orders?.length || 0} รายการ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              จำนวนที่นั่ง:
                            </span>
                            <span className="font-medium">
                              {selectedTable?.capacity || 0} ที่นั่ง
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              ระยะเวลาที่ใช้:
                            </span>
                            <span className="font-medium">
                              {selectedTable?.checkinTime
                                ? getTimeAgo(
                                    new Date(
                                      new Date().setHours(
                                        Number.parseInt(
                                          selectedTable.checkinTime.split(
                                            ":"
                                          )[0]
                                        ),
                                        Number.parseInt(
                                          selectedTable.checkinTime.split(
                                            ":"
                                          )[1]
                                        )
                                      )
                                    ).toISOString()
                                  )
                                : "-"}
                            </span>
                          </div>
                          <Separator className="my-4" />
                          <div className="flex justify-between text-xl font-semibold">
                            <span>ยอดรวมทั้งสิ้น:</span>
                            <span className="text-gray-900 dark:text-gray-100">
                              ฿{calculateTableTotal(selectedTable)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-6">
                          การชำระเงิน
                        </h3>
                        {isPaid ? (
                          <div className="text-center py-8">
                            <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                              <Check className="h-10 w-10" />
                            </div>
                            <p className="text-green-700 dark:text-green-100 font-medium text-lg">
                              ชำระเงินเรียบร้อยแล้ว
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              สามารถเช็คเอาท์โต๊ะได้
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col items-center mb-6">
                              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-4">
                                <QRCodeSVG
                                  value={`https://promptpay.io/0812345678/${calculateTableTotal(
                                    selectedTable
                                  )}`}
                                  size={150}
                                  level="H"
                                  includeMargin={true}
                                  fgColor="#000000"
                                  bgColor="#ffffff"
                                />
                              </div>
                              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                สแกน QR Code เพื่อชำระเงินด้วย PromptPay
                              </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <Button
                                variant="outline"
                                onClick={handleMarkAsPaid}
                                disabled={!selectedTable?.orders?.length}
                                className="border-gray-300 hover:bg-gray-900 hover:text-white dark:border-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-all duration-300"
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                บันทึกการชำระเงิน
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleShowQR(selectedTable)}
                                className="border-gray-300 hover:bg-gray-900 hover:text-white dark:border-gray-600 dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-all duration-300"
                              >
                                <QrCode className="mr-2 h-4 w-4" />
                                แสดง QR สั่งอาหาร
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setDetailsDialogOpen(false)}
                    className="flex-1 border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-all duration-300"
                  >
                    <X className="mr-2 h-4 w-4" />
                    ปิด
                  </Button>
                  <Button
                    onClick={() => handleCheckout(selectedTable?.id)}
                    disabled={!isPaid && selectedTable?.orders?.length > 0}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-all duration-300"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    เช็คเอาท์
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
