"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { orderService } from "@/services/order/order.service";
import { Order, OrderStatus } from "@/interfaces/order.interface";
import { Button } from "@/components/ui/button";
import { OrderColumn } from "./kitchen-order-column";
import { Branch } from "@/interfaces/branch.interface";

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

  // Load orders on mount
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        if (!branchId) {
          throw new Error("Branch ID is required to load orders");
        }
        setError(null);

        // เปลี่ยนเป็นใช้ orderService
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
    }

    loadOrders();

    // ตั้งเวลาโหลดออเดอร์ใหม่ทุก 30 วินาที
    const interval = setInterval(async () => {
      if (!branchId) return;

      try {
        const freshOrders = await orderService.getOrdersForBranch(branchId);
        const activeOrders = freshOrders.filter(
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

        setOrders(ordersWithLineStatus);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [branchId]);

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
        // บันทึกสถานะในตัวแปรชั่วคราว (ไม่ต้องส่งไปยัง backend)
        const updatedOrderLines = [...order.orderLines];
        updatedOrderLines[itemIndex] = {
          ...updatedOrderLines[itemIndex],
          status: "served", // เพิ่มสถานะในฝั่ง frontend เท่านั้น
        };

        // ตรวจสอบว่าทุกรายการใน orderLines served หรือยัง
        const allServed = updatedOrderLines.every(
          (line) => (line.status as OrderStatus) === "served"
        );

        // ถ้าทุกรายการ served แล้ว อัพเดทสถานะออร์เดอร์เป็น served
        if (allServed) {
          await orderService.updateOrderStatus(orderId, "served");
        }

        // โหลดออร์เดอร์ใหม่
        const updatedOrders = await orderService.getOrdersForBranch(branchId);
        const activeOrders = updatedOrders.filter(
          (order) => order.status !== "paid"
        );

        // เพิ่มสถานะให้กับ orderLines สำหรับแสดงผลในฝั่ง frontend
        const ordersWithLineStatus = activeOrders.map((order) => {
          if (order._id === orderId) {
            // สำหรับออร์เดอร์ที่กำลังอัพเดท ใช้สถานะที่เรากำหนดเอง
            return {
              ...order,
              orderLines: order.orderLines.map((line, idx) => ({
                ...line,
                status:
                  idx === itemIndex ? "served" : line.status || order.status,
              })),
            };
          } else if (order.orderLines) {
            // สำหรับออร์เดอร์อื่นๆ ใช้สถานะจาก order
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

        setOrders(ordersWithLineStatus);
      }
    } catch (err) {
      console.error("Failed to update order item:", err);
      setError("ไม่สามารถอัปเดตรายการได้");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveOrder = async (orderId: string, newStatus: OrderStatus) => {
    if (!branchId) return;

    try {
      setIsUpdating(true);

      // อัพเดทสถานะออร์เดอร์ (ไม่ส่ง orderLines)
      await orderService.updateOrderStatus(orderId, newStatus);

      // โหลดข้อมูลใหม่
      const updatedOrders = await orderService.getOrdersForBranch(branchId);
      const activeOrders = updatedOrders.filter(
        (order) => order.status !== "paid"
      );

      // เพิ่มสถานะให้กับ orderLines ในฝั่ง frontend สำหรับแสดงผลเท่านั้น
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

      setOrders(ordersWithLineStatus);
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError("ไม่สามารถย้ายออร์เดอร์ได้");
    } finally {
      setIsUpdating(false);
    }
  };

  // ฟังก์ชันเพื่อแปลง _id ที่ใช้ใน order เป็น id ที่ใช้ในการระบุรายการ
  const getItemId = (orderId: string, index: number) => {
    return `${orderId}_item_${index}`;
  };

  // เปลี่ยนจาก pending เป็น received ตามสถานะจริงจากฐานข้อมูล
  const receivedOrders = orders.filter((o) => o.status === "received");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const servedOrders = orders.filter((o) => o.status === "served");

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
