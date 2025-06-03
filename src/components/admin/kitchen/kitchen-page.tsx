"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { orderService } from "@/services/order/order.service";
import { Order, OrderStatus } from "@/interfaces/order.interface";
import { Button } from "@/components/ui/button";
import { OrderColumn } from "./kitchen-order-column";
import { Branch } from "@/interfaces/branch.interface";
import { useOrdersSocket } from "@/hooks/useOrdersSocket";
import { toast } from "sonner";

interface KitchenDisplayProps {
  branchCode: string;
  branchId?: string;
  branch?: Branch | null;
}

export function KitchenDisplay({ branchId }: KitchenDisplayProps) {
  console.log("[Kitchen] branchId:", branchId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [usePolling, setUsePolling] = useState(false);

  // โหลดออร์เดอร์จาก API
  const loadOrders = useCallback(async () => {
    if (!branchId) return;
    try {
      setError(null);

      const ordersData = await orderService.getOrdersForBranch(branchId);

      // กรองเฉพาะออร์เดอร์ที่ยังไม่เป็น paid
      const activeOrders = ordersData.filter(
        (order) => order.status !== "paid"
      );

      // เพิ่มสถานะให้กับ orderLines ถ้ายังไม่มี
      const ordersWithLineStatus = activeOrders.map((order) => {
        if (order.orderLines) {
          return {
            ...order,
            orderLines: order.orderLines.map((line) => ({
              ...line,
              status: line.status || order.status,
            })),
          };
        }
        return order;
      });

      console.log(
        "Loaded orders:",
        JSON.stringify(ordersWithLineStatus, null, 2)
      );
      setOrders(ordersWithLineStatus);
    } catch (err) {
      console.error("Load orders error:", err);
      setError("ไม่สามารถโหลดข้อมูลออร์เดอร์ได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // จัดการออร์เดอร์ใหม่ที่ได้รับจาก WebSocket
  const handleNewOrder = useCallback((newOrder: Order) => {
    console.log("New order received via WebSocket:", newOrder);

    if (newOrder.status === "paid") return;

    // แสดง toast notification เมื่อได้รับออร์เดอร์ใหม่
    const tableName = newOrder.tableId?.name || "ไม่ระบุโต๊ะ";
    toast.success("มีออร์เดอร์ใหม่!", {
      description: (
        <div className="mt-1">
          <div className="font-medium">{tableName}</div>
          <div className="mt-1 space-y-1 max-h-24 overflow-auto">
            {newOrder.orderLines?.slice(0, 3).map((line, i) => {
              const menuName =
                typeof line.menuItemId === "object"
                  ? line.menuItemId.name
                  : "รายการอาหาร";
              const qty = line.qty || line.quantity || 1;
              return (
                <div key={i} className="text-sm">
                  • {menuName} x{qty}
                </div>
              );
            })}
            {newOrder.orderLines && newOrder.orderLines.length > 3 && (
              <div className="text-xs text-gray-500 mt-1">
                + อีก {newOrder.orderLines.length - 3} รายการ
              </div>
            )}
          </div>
        </div>
      ),
      duration: 6000,
    });

    // เพิ่มสถานะให้กับ orderLines ถ้ายังไม่มี
    const orderWithLineStatus = {
      ...newOrder,
      orderLines:
        newOrder.orderLines?.map((line) => ({
          ...line,
          status: line.status || newOrder.status,
        })) || [],
    };

    // อัพเดทรายการออร์เดอร์โดยเพิ่มออร์เดอร์ใหม่เข้าไป
    setOrders((current) => {
      // ตรวจสอบว่ามีออร์เดอร์นี้อยู่แล้วหรือไม่
      const existingOrderIndex = current.findIndex(
        (o) => o._id === newOrder._id
      );
      if (existingOrderIndex >= 0) {
        // อัพเดทออร์เดอร์เดิม
        const updated = [...current];
        updated[existingOrderIndex] = orderWithLineStatus;
        return updated;
      } else {
        // เพิ่มออร์เดอร์ใหม่
        return [...current, orderWithLineStatus];
      }
    });
  }, []);

  // จัดการการเปลี่ยนสถานะออร์เดอร์ที่ได้รับจาก WebSocket
  const handleOrderStatusChanged = useCallback((updatedOrder: Order) => {
    console.log("Order status changed via WebSocket:", updatedOrder);

    // สร้าง mapping สถานะเป็นข้อความไทย
    const statusTextMap = {
      received: "รอรับออร์เดอร์",
      preparing: "กำลังทำ",
      served: "เสิร์ฟแล้ว",
      pending: "รอดำเนินการ",
      paid: "ชำระเงินแล้ว",
    };

    // แสดง toast notification เมื่อสถานะเปลี่ยน
    const tableName = updatedOrder.tableId?.name || "ไม่ระบุโต๊ะ";

    if (updatedOrder.status !== "paid") {
      toast.info("อัพเดทสถานะออร์เดอร์", {
        description: (
          <div className="mt-1">
            <div className="font-medium">โต๊ะ: {tableName}</div>
            <div className="mt-1 py-1 px-2 bg-blue-50 rounded-md border border-blue-100">
              <span>สถานะใหม่: </span>
              <span className="font-semibold text-blue-700">
                {statusTextMap[updatedOrder.status]}
              </span>
            </div>
          </div>
        ),
        duration: 4000,
      });
    }

    if (updatedOrder.status === "paid") {
      // ถ้าสถานะเป็น paid ให้ลบออกจากรายการ
      setOrders((current) => current.filter((o) => o._id !== updatedOrder._id));
      return;
    }

    // เพิ่มสถานะให้กับ orderLines ถ้ายังไม่มี
    const orderWithLineStatus = {
      ...updatedOrder,
      orderLines:
        updatedOrder.orderLines?.map((line) => ({
          ...line,
          status: line.status || updatedOrder.status,
        })) || [],
    };

    // อัพเดทรายการออร์เดอร์
    setOrders((current) => {
      const existingOrderIndex = current.findIndex(
        (o) => o._id === updatedOrder._id
      );
      if (existingOrderIndex >= 0) {
        const updated = [...current];
        updated[existingOrderIndex] = orderWithLineStatus;
        return updated;
      }
      return current;
    });
  }, []);

  // จัดการข้อผิดพลาดจาก WebSocket
  const handleSocketError = useCallback((err: Error) => {
    console.error("WebSocket error:", err);
    setUsePolling(true);
  }, []);

  // เชื่อมต่อกับ WebSocket ด้วย custom hook
  const { isConnected } = useOrdersSocket({
    branchId,
    onNewOrder: handleNewOrder,
    onOrderStatusChanged: handleOrderStatusChanged,
    onError: handleSocketError,
  });

  // โหลดข้อมูลออร์เดอร์ครั้งแรกและตั้งค่า polling ถ้าจำเป็น
  useEffect(() => {
    loadOrders();

    // ใช้ polling เป็น fallback เมื่อ WebSocket ไม่ทำงาน
    let pollingInterval: NodeJS.Timeout | null = null;

    if (usePolling && branchId) {
      pollingInterval = setInterval(() => {
        console.log("Using polling as fallback");
        loadOrders();
      }, 30000); // poll ทุก 30 วินาที
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [branchId, loadOrders, usePolling]);

  // อัพเดทรายการในออร์เดอร์
  const handleCompleteItem = async (orderId: string, itemId: string) => {
    if (!branchId) return;

    try {
      setIsUpdating(true);

      // ดึงข้อมูลออร์เดอร์ก่อน
      const orderResponse = await orderService.getOrderById(orderId);
      const order = orderResponse.order;

      // หาว่า itemId เป็น index ที่เท่าไหร่ (orderId_item_index)
      const itemIndex = parseInt(itemId.split("_").pop() || "0");

      // เก็บสถานะของ orderLines ไว้ในตัวแปรก่อน แต่ไม่ส่งไปยัง backend
      if (order && order.orderLines && order.orderLines[itemIndex]) {
        const menuItem = order.orderLines[itemIndex].menuItemId;
        const menuName =
          typeof menuItem === "object" ? menuItem.name : "รายการอาหาร";
        const tableName =
          typeof order.tableId === "object"
            ? order.tableId.name
            : "ไม่ระบุโต๊ะ";

        // บันทึกสถานะในตัวแปรชั่วคราว (ไม่ต้องส่งไปยัง backend)
        const updatedOrderLines = [...order.orderLines];
        updatedOrderLines[itemIndex] = {
          ...updatedOrderLines[itemIndex],
          status: "served", // เพิ่มสถานะในฝั่ง frontend เท่านั้น
        };

        // แสดง toast สำหรับรายการที่ทำเสร็จ
        toast.success(`${menuName} เสร็จเรียบร้อย`, {
          description: (
            <div className="text-sm">
              <span>โต๊ะ: {tableName}</span>
            </div>
          ),
          duration: 1500, // แสดงเพียง 1.5 วินาที เพื่อไม่ให้รบกวนมากเกินไป
        });

        // ตรวจสอบว่าทุกรายการใน orderLines served หรือยัง
        const allServed = updatedOrderLines.every(
          (line) => (line.status as OrderStatus) === "served"
        );

        // ถ้าทุกรายการ served แล้ว อัพเดทสถานะออร์เดอร์เป็น served
        if (allServed) {
          // แสดง toast เมื่อทุกรายการเสร็จสมบูรณ์
          toast.success("ออร์เดอร์เสร็จสมบูรณ์!", {
            description: (
              <div className="mt-1">
                <div className="font-medium">โต๊ะ: {tableName}</div>
                <div className="mt-1 py-1 px-2 bg-green-50 rounded-md border border-green-100">
                  <span className="font-semibold text-green-700">
                    พร้อมเสิร์ฟแล้ว 🍽️
                  </span>
                </div>
              </div>
            ),
            duration: 3000,
          });

          await orderService.updateOrderStatus(orderId, "served");
          // ไม่จำเป็นต้องโหลดข้อมูลใหม่เพราะเราจะได้รับการอัพเดทผ่าน WebSocket
        }

        // อัพเดทข้อมูลในฝั่ง frontend ทันทีเพื่อความรวดเร็ว
        setOrders((currentOrders) =>
          currentOrders.map((order) => {
            if (order._id === orderId) {
              return {
                ...order,
                orderLines: order.orderLines.map((line, idx) => ({
                  ...line,
                  status:
                    idx === itemIndex ? "served" : line.status || order.status,
                })),
              };
            }
            return order;
          })
        );
      }
    } catch (err) {
      console.error("Failed to update order item:", err);
      setError("ไม่สามารถอัปเดตรายการได้");

      // แสดง toast error เมื่อเกิดข้อผิดพลาด
      toast.error("ไม่สามารถอัปเดตรายการได้", {
        description: "กรุณาลองอีกครั้งหรือติดต่อผู้ดูแลระบบ",
      });

      // โหลดข้อมูลใหม่เมื่อเกิดข้อผิดพลาด
      await loadOrders();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveOrder = async (orderId: string, newStatus: OrderStatus) => {
    if (!branchId) return;

    try {
      setIsUpdating(true);

      // หาข้อมูลออร์เดอร์จาก state ปัจจุบัน
      const currentOrder = orders.find((o) => o._id === orderId);
      if (!currentOrder) return;

      const tableName =
        typeof currentOrder.tableId === "object"
          ? currentOrder.tableId.name
          : "ไม่ระบุโต๊ะ";
      const statusTextMap = {
        received: "รอรับออร์เดอร์",
        preparing: "กำลังทำ",
        served: "เสิร์ฟแล้ว",
        pending: "รอดำเนินการ",
        paid: "ชำระเงินแล้ว",
      };

      // แสดง toast ตามสถานะที่เปลี่ยน
      if (newStatus === "preparing") {
        toast.info(`สถานะเปลี่ยนเป็น ${statusTextMap[newStatus]}`, {
          description: (
            <div className="mt-1">
              <div className="font-medium">โต๊ะ: {tableName}</div>
              <div className="mt-1 py-1 px-2 bg-blue-50 rounded-md border border-blue-100">
                <span className="font-semibold text-blue-700">
                  เริ่มทำรายการอาหาร 🔥
                </span>
              </div>
            </div>
          ),
          duration: 3000,
        });
      } else if (newStatus === "served") {
        toast.success(`สถานะเปลี่ยนเป็น ${statusTextMap[newStatus]}`, {
          description: (
            <div className="mt-1">
              <div className="font-medium">โต๊ะ: {tableName}</div>
              <div className="mt-1 py-1 px-2 bg-green-50 rounded-md border border-green-100">
                <span className="font-semibold text-green-700">
                  พร้อมเสิร์ฟแล้ว 🍽️
                </span>
              </div>
            </div>
          ),
          duration: 3000,
        });
      }

      // อัพเดทสถานะออร์เดอร์ (ไม่ส่ง orderLines)
      await orderService.updateOrderStatus(orderId, newStatus);

      // อัพเดทข้อมูลในฝั่ง frontend ทันทีเพื่อความรวดเร็ว
      setOrders((currentOrders) =>
        currentOrders.map((order) => {
          if (order._id === orderId) {
            return {
              ...order,
              status: newStatus,
              orderLines: order.orderLines.map((line) => ({
                ...line,
                status: line.status || newStatus,
              })),
            };
          }
          return order;
        })
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError("ไม่สามารถย้ายออร์เดอร์ได้");

      // แสดง toast error เมื่อเกิดข้อผิดพลาด
      toast.error("ไม่สามารถย้ายออร์เดอร์ได้", {
        description: "กรุณาลองอีกครั้งหรือติดต่อผู้ดูแลระบบ",
      });

      // โหลดข้อมูลใหม่เมื่อเกิดข้อผิดพลาด
      await loadOrders();
    } finally {
      setIsUpdating(false);
    }
  };

  // ฟังก์ชันเพื่อแปลง _id ที่ใช้ใน order เป็น id ที่ใช้ในการระบุรายการ
  const getItemId = (orderId: string, index: number) => {
    return `${orderId}_item_${index}`;
  };

  // เปลี่ยนจาก pending เป็น received ตามสถานะจริงจากฐานข้อมูล
  const receivedOrders = orders
    .filter((o) => o.status === "received")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const preparingOrders = orders
    .filter((o) => o.status === "preparing")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const servedOrders = orders
    .filter((o) => o.status === "served")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-muted-foreground" />
        <p className="text-foreground">กำลังโหลดข้อมูลออร์เดอร์...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-background">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-2"
          >
            ลองอีกครั้ง
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 h-full bg-background">
      <div className="flex flex-col space-y-4 h-full">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            ห้องครัว
            {isConnected && (
              <span className="ml-2 text-sm font-normal text-green-500 bg-green-100 px-2 py-1 rounded-full">
                real-time พร้อมใช้งาน
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            จัดการออร์เดอร์และการเตรียมอาหาร
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[calc(100vh-200px)]">
          <OrderColumn
            title="รอรับออเดอร์"
            orders={receivedOrders}
            status="received"
            nextStatus="preparing"
            isUpdating={isUpdating}
            onCompleteItem={handleCompleteItem}
            onMoveOrder={handleMoveOrder}
            getItemId={getItemId}
          />
          <OrderColumn
            title="กำลังทำ"
            orders={preparingOrders}
            status="preparing"
            nextStatus="served"
            isUpdating={isUpdating}
            onCompleteItem={handleCompleteItem}
            onMoveOrder={handleMoveOrder}
            getItemId={getItemId}
          />
          <OrderColumn
            title="เสิร์ฟแล้ว"
            orders={servedOrders}
            status="served"
            isUpdating={isUpdating}
            onCompleteItem={handleCompleteItem}
            onMoveOrder={handleMoveOrder}
            getItemId={getItemId}
          />
        </div>
      </div>
    </div>
  );
}
