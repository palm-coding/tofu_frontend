"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { kitchenService } from "@/services/kitchen.service";
import { KitchenOrder, OrderStatus } from "@/interfaces/kitchen.interface";
import { Button } from "@/components/ui/button";
import { OrderColumn } from "./order-column";
import { Branch } from "@/interfaces/branch.interface";

interface KitchenDisplayProps {
  branchCode: string; // The URL-friendly code (e.g., "hatyai")
  branchId?: string; // The MongoDB _id (optional if not available yet)
  branch?: Branch | null; // The full branch object (optional)
}

export function KitchenDisplay({ branchId }: KitchenDisplayProps) {
  console.log("[Kitchen] branchId:", branchId);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
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
        const response = await kitchenService.getOrders({ branchId });
        console.log("Loaded orders:", response.orders);
        setOrders(response.orders);
      } catch (err) {
        console.error("Load orders error:", err);
        setError("ไม่สามารถโหลดข้อมูลออร์เดอร์ได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false); // ✅ สำคัญมาก
      }
    }

    loadOrders();

    const interval = setInterval(async () => {
      if (!branchId) {
        throw new Error("Branch ID is required to load orders");
      }

      try {
        if (orders.length > 0) {
          const lastTimestamp = new Date(
            Math.max(...orders.map((o) => new Date(o.createdAt).getTime()))
          ).toISOString();

          const response = await kitchenService.pollForNewOrders(
            branchId,
            lastTimestamp
          );
          const newOrderIds = response.orders.map((o) => o.id);
          const updated = orders.filter((o) => !newOrderIds.includes(o.id));
          setOrders([...updated, ...response.orders]);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [branchId]); // ✅ FIXED: removed 'orders'

  // Actions
  const handleCompleteItem = async (orderId: string, itemId: string) => {
    if (!branchId) {
      throw new Error("Branch ID is required to load orders");
    }
    try {
      setIsUpdating(true);
      const response = await kitchenService.updateOrderItemStatus(branchId, {
        orderId,
        itemId,
        status: "served",
      });
      updateOrder(response.order);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถอัปเดตรายการได้");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveOrder = async (orderId: string, newStatus: OrderStatus) => {
    if (!branchId) {
      throw new Error("Branch ID is required to load orders");
    }
    try {
      setIsUpdating(true);
      const response = await kitchenService.updateOrderStatus(branchId, {
        orderId,
        status: newStatus,
      });
      updateOrder(response.order);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถย้ายออร์เดอร์ได้");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateOrder = (updated: KitchenOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
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
            orders={pendingOrders}
            status="pending"
            nextStatus="preparing"
            isUpdating={isUpdating}
            onCompleteItem={handleCompleteItem}
            onMoveOrder={handleMoveOrder}
          />
          <OrderColumn
            title="กำลังทำ"
            orders={preparingOrders}
            status="preparing"
            nextStatus="served"
            isUpdating={isUpdating}
            onCompleteItem={handleCompleteItem}
            onMoveOrder={handleMoveOrder}
          />
          <OrderColumn
            title="เสิร์ฟแล้ว"
            orders={servedOrders}
            status="served"
            isUpdating={isUpdating}
            onCompleteItem={handleCompleteItem}
            onMoveOrder={handleMoveOrder}
          />
        </div>
      </div>
    </div>
  );
}
