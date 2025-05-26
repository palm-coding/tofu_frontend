"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Coffee,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { kitchenService } from "@/services/kitchen.service";
import { KitchenOrder, OrderStatus } from "@/interfaces/kitchen.interface";
import { cn } from "@/lib/utils";

interface KitchenDisplayProps {
  branchId: string;
}

export function KitchenDisplay({ branchId }: KitchenDisplayProps) {
  // State
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load orders on component mount
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const response = await kitchenService.getOrders({ branchId });
        setOrders(response.orders);
      } catch (err) {
        console.error("Error loading kitchen orders:", err);
        setError("ไม่สามารถโหลดข้อมูลออร์เดอร์ได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();

    // Optional: Set up periodic polling for new orders
    const pollInterval = setInterval(async () => {
      try {
        // Get the most recent order timestamp
        if (orders.length > 0) {
          const timestamps = orders.map((o) => new Date(o.createdAt).getTime());
          const lastTimestamp = new Date(Math.max(...timestamps)).toISOString();

          const response = await kitchenService.pollForNewOrders(
            branchId,
            lastTimestamp
          );

          if (response.orders.length > 0) {
            // Merge new orders with existing ones
            const newOrderIds = response.orders.map((o) => o.id);
            const filteredOrders = orders.filter(
              (o) => !newOrderIds.includes(o.id)
            );

            setOrders([...filteredOrders, ...response.orders]);
          }
        }
      } catch (err) {
        // Silent failure for polling - we don't want to interrupt the user
        console.error("Polling error:", err);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [branchId]);

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
      console.error("Invalid date format:", dateString, error);
      return "ไม่ทราบเวลา";
    }
  };

  const handleCompleteItem = async (orderId: string, itemId: string) => {
    try {
      setIsUpdating(true);

      const response = await kitchenService.updateOrderItemStatus(branchId, {
        orderId,
        itemId,
        status: "served",
      });

      // Update local state with the updated order
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? response.order : order
      );

      setOrders(updatedOrders);
    } catch (err) {
      console.error("Failed to update item status:", err);
      setError("ไม่สามารถอัปเดตสถานะรายการได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMoveOrder = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);

      const response = await kitchenService.updateOrderStatus(branchId, {
        orderId,
        status: newStatus,
      });

      // Update local state with the updated order
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? response.order : order
      );

      setOrders(updatedOrders);
    } catch (err) {
      console.error("Failed to move order:", err);
      setError("ไม่สามารถย้ายออร์เดอร์ได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get color classes based on order status
  const getOrderStatusColors = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return {
          borderColorClass: "border-amber-500 dark:border-amber-400",
          buttonClass:
            "bg-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-white",
        };
      case "preparing":
        return {
          borderColorClass: "border-blue-500 dark:border-blue-400",
          buttonClass:
            "bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 text-white",
        };
      case "served":
        return {
          borderColorClass: "border-green-500 dark:border-green-400",
          buttonClass:
            "bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500 text-white",
        };
      default:
        return {
          borderColorClass: "border-border",
          buttonClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
        };
    }
  };

  // Filter orders by status
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing"
  );
  const servedOrders = orders.filter((order) => order.status === "served");

  // Column rendering function
  const renderOrderColumn = (
    title: string,
    statusOrders: KitchenOrder[],
    status: OrderStatus,
    nextStatus?: OrderStatus
  ) => {
    const { borderColorClass, buttonClass } = getOrderStatusColors(status);

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 bg-card text-card-foreground p-3 rounded-t-md">
          <h3 className="font-semibold">{title}</h3>
          <Badge
            variant="outline"
            className={cn(
              "text-white",
              status === "pending"
                ? "bg-amber-500 dark:bg-amber-400"
                : status === "preparing"
                ? "bg-blue-500 dark:bg-blue-400"
                : "bg-green-500 dark:bg-green-400"
            )}
          >
            {statusOrders.length}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1 custom-scrollbar">
          {statusOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-md p-4">
              <Coffee className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
              <p className="text-muted-foreground text-sm">ไม่มีออร์เดอร์</p>
            </div>
          ) : (
            statusOrders.map((order) => (
              <Card
                key={order.id}
                className={cn(
                  "border-0 border-l-4 shadow-sm hover:shadow-md transition-all duration-200",
                  borderColorClass // เปลี่ยนจาก getOrderStatusColors(status).borderColor
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-card-foreground">
                      {order.tableName || "โต๊ะไม่ระบุ"}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(order.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm mb-2 text-card-foreground">
                    ลูกค้า: {order.customerName || "ไม่ระบุ"}
                  </p>
                  <ul className="space-y-2">
                    {order.items &&
                      order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium text-card-foreground">
                              {item.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              x{item.quantity || 0}
                            </span>
                            {item.note && (
                              <p className="text-xs text-muted-foreground">
                                หมายเหตุ: {item.note}
                              </p>
                            )}
                          </div>
                          {status === "preparing" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCompleteItem(order.id, item.id)
                              }
                              disabled={item.status === "served" || isUpdating}
                              className={cn(
                                "border-input",
                                item.status === "served" ? "bg-accent/30" : ""
                              )}
                            >
                              {item.status === "served" ? (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4 text-[var(--chart-3)]" />
                                  เสร็จแล้ว
                                </>
                              ) : isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "เสร็จ"
                              )}
                            </Button>
                          )}
                        </li>
                      ))}
                  </ul>
                </CardContent>
                {nextStatus && (
                  <CardFooter>
                    <Button
                      className={cn("w-full", buttonClass)}
                      onClick={() => handleMoveOrder(order.id, nextStatus)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {status === "pending" ? "รับออร์เดอร์" : "เสร็จทั้งหมด"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

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
            variant="outline"
            className="mt-2 border-input"
            onClick={() => window.location.reload()}
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

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[calc(100vh-200px)]">
          <div className="bg-card rounded-md shadow p-3 flex flex-col border border-border">
            {renderOrderColumn(
              "รอรับออเดอร์",
              pendingOrders,
              "pending",
              "preparing"
            )}
          </div>
          <div className="bg-card rounded-md shadow p-3 flex flex-col border border-border">
            {renderOrderColumn(
              "กำลังทำ",
              preparingOrders,
              "preparing",
              "served"
            )}
          </div>
          <div className="bg-card rounded-md shadow p-3 flex flex-col border border-border">
            {renderOrderColumn("เสิร์ฟแล้ว", servedOrders, "served")}
          </div>
        </div>
      </div>
    </div>
  );
}
