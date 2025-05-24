"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, CheckCircle, ArrowRight } from "lucide-react";

interface KitchenDisplayProps {
  branchId: string;
}

// Mock orders data
const mockOrders = [
  {
    id: "order1",
    tableId: "1",
    tableName: "โต๊ะ 1",
    customerName: "คุณสมชาย",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
    items: [
      {
        id: "item1",
        name: "น้ำเต้าหู้ร้อน",
        quantity: 2,
        note: "หวานน้อย",
        status: "pending",
      },
      {
        id: "item4",
        name: "ปาท่องโก๋",
        quantity: 4,
        note: "",
        status: "pending",
      },
    ],
  },
  {
    id: "order2",
    tableId: "5",
    tableName: "โต๊ะ 5",
    customerName: "คุณนภา",
    status: "preparing",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12 minutes ago
    items: [
      {
        id: "item2",
        name: "น้ำเต้าหู้เย็น",
        quantity: 1,
        note: "ไม่ใส่น้ำแข็ง",
        status: "preparing",
      },
      {
        id: "item3",
        name: "น้ำเต้าหู้ปั่น",
        quantity: 1,
        note: "",
        status: "preparing",
      },
      {
        id: "item5",
        name: "ขนมไข่",
        quantity: 2,
        note: "",
        status: "preparing",
      },
    ],
  },
  {
    id: "order3",
    tableId: "8",
    tableName: "โต๊ะ 8",
    customerName: "คุณวิชัย",
    status: "served",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
    items: [
      {
        id: "item1",
        name: "น้ำเต้าหู้ร้อน",
        quantity: 3,
        note: "",
        status: "served",
      },
      {
        id: "item6",
        name: "เต้าฮวยฟรุตสลัด",
        quantity: 1,
        note: "ไม่ใส่แตงโม",
        status: "served",
      },
    ],
  },
];

export function KitchenDisplay({ branchId }: KitchenDisplayProps) {
  const [orders, setOrders] = useState(mockOrders);

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

  const handleCompleteItem = (orderId: string, itemId: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        const updatedItems = order.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, status: "served" };
          }
          return item;
        });

        // Check if all items are served
        const allServed = updatedItems.every(
          (item) => item.status === "served"
        );

        return {
          ...order,
          items: updatedItems,
          status: allServed ? "served" : "preparing",
        };
      }
      return order;
    });

    setOrders(updatedOrders);
  };

  const handleMoveOrder = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          status: newStatus,
          items: order.items.map((item) => ({ ...item, status: newStatus })),
        };
      }
      return order;
    });

    setOrders(updatedOrders);
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
    statusOrders: typeof orders,
    status: string,
    nextStatus?: string
  ) => {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 bg-white text-black p-3 rounded-t-md">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="outline" className="bg-red-300 ">
            {statusOrders.length}
          </Badge>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
          {statusOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-md p-4">
              <Coffee className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
              <p className="text-muted-foreground text-sm">ไม่มีออร์เดอร์</p>
            </div>
          ) : (
            statusOrders.map((order) => (
              <Card
                key={order.id}
                className="border-l-4 shadow-sm hover:shadow-md transition-all duration-200"
                style={{
                  borderLeftColor:
                    status === "pending"
                      ? "#f59e0b"
                      : status === "preparing"
                      ? "#3b82f6"
                      : "#10b981",
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {order.tableName || "โต๊ะไม่ระบุ"}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeAgo(order.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm mb-2">
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
                            <span className="font-medium">{item.name}</span>
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
                              disabled={item.status === "served"}
                              className={
                                item.status === "served" ? "bg-green-50" : ""
                              }
                            >
                              {item.status === "served" ? (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                                  เสร็จแล้ว
                                </>
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
                      className="w-full"
                      onClick={() => handleMoveOrder(order.id, nextStatus)}
                      style={{
                        backgroundColor:
                          status === "pending" ? "#f59e0b" : "#3b82f6",
                        color: "white",
                      }}
                    >
                      {status === "pending" ? "ร  บออร์เดอร์" : "เสร็จทั้งหมด"}
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

  return (
    <div className="p-4 h-full bg-gray-50">
      <div className="flex flex-col space-y-4 h-full">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ห้องครัว</h1>
          <p className="text-muted-foreground">
            จัดการออร์เดอร์และการเตรียมอาหาร
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[calc(100vh-200px)]">
          <div className="bg-white rounded-md shadow p-3 flex flex-col">
            {renderOrderColumn(
              "รอรับออเดอร์",
              pendingOrders,
              "pending",
              "preparing"
            )}
          </div>
          <div className="bg-white rounded-md shadow p-3 flex flex-col">
            {renderOrderColumn(
              "กำลังทำ",
              preparingOrders,
              "preparing",
              "served"
            )}
          </div>
          <div className="bg-white rounded-md shadow p-3 flex flex-col">
            {renderOrderColumn("เสิร์ฟแล้ว", servedOrders, "served")}
          </div>
        </div>
      </div>
    </div>
  );
}
