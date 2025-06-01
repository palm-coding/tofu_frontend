import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Clock, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order, OrderStatus } from "@/interfaces/order.interface"; // เปลี่ยนเป็น Order interface
import { getTimeAgo, getOrderStatusColors } from "./helpers";
import { Button } from "@/components/ui/button";

export function OrderCard({
  order,
  status,
  borderColorClass,
  nextStatus,
  isUpdating,
  onCompleteItem,
  onMoveOrder,
  getItemId,
}: {
  order: Order; // เปลี่ยนเป็น Order
  status: OrderStatus;
  borderColorClass: string;
  nextStatus?: OrderStatus;
  isUpdating: boolean;
  onCompleteItem: (itemId: string) => void;
  onMoveOrder: () => void;
  getItemId: (orderId: string, index: number) => string;
}) {
  // ฟังก์ชันช่วยหาชื่อของโต๊ะ
  const getTableName = () => {
    // ตรวจสอบว่า tableId เป็น object หรือ string
    if (typeof order.tableId === "object" && order.tableId !== null) {
      // ถ้าเป็น object และมี property name ก็เข้าถึงโดยตรง
      return order.tableId.name || `โต๊ะ ?`;
    } else {
      console.error("Invalid tableId format:", order.tableId);
    }
  };

  return (
    <Card
      key={order._id} // ใช้ _id แทน id
      className={cn(
        "border-0 border-l-4 shadow-sm hover:shadow-md transition-all duration-200",
        borderColorClass
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-card-foreground">
            {getTableName()}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {getTimeAgo(order.createdAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm mb-2 text-card-foreground">
          ลูกค้า: {order.orderBy || "ไม่ระบุ"}
        </p>
        <ul className="space-y-2">
          {order.orderLines.map((item, index) => {
            // สร้าง itemId ที่ใช้สำหรับอ้างอิงรายการสั่งอาหาร
            const itemId = getItemId(order._id, index);

            // ดึงชื่อเมนูจาก menuItemId
            const menuName =
              typeof item.menuItemId === "object" && item.menuItemId
                ? item.menuItemId.name
                : "ไม่ระบุรายการ";

            return (
              <li key={itemId} className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-card-foreground">
                    {menuName}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    x{item.qty || item.quantity || 1}
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
                    onClick={() => onCompleteItem(itemId)}
                    disabled={item.status === "served" || isUpdating}
                    className={cn(
                      "border-input",
                      item.status === "served" && "bg-accent/30"
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
            );
          })}
        </ul>
      </CardContent>
      {nextStatus && (
        <CardFooter>
          <Button
            className={cn("w-full", getOrderStatusColors(status).buttonClass)}
            onClick={onMoveOrder}
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {status === "received"
              ? "รับออร์เดอร์"
              : status === "preparing"
              ? "เสร็จทั้งหมด"
              : status === "served"
              ? "ชำระเงิน"
              : ""}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
