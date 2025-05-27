import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { KitchenOrder, OrderStatus } from "@/interfaces/kitchen.interface";
import { OrderItemRow } from "./order-itemrow";
import { getTimeAgo, getOrderStatusColors } from "./helpers";
import { Button } from "@/components/ui/button";

export function OrderCard({
  order,
  status,
  borderColor,
  nextStatus,
  isUpdating,
  onCompleteItem,
  onMoveOrder,
}: {
  order: KitchenOrder;
  status: OrderStatus;
  borderColor: string;
  nextStatus?: OrderStatus;
  isUpdating: boolean;
  onCompleteItem: (itemId: string) => void;
  onMoveOrder: () => void;
}) {
  return (
    <Card
      key={order.id}
      className="border-l-4 shadow-sm hover:shadow-md transition-all duration-200"
      style={{ borderLeftColor: borderColor }}
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
          {order.items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              status={status}
              isUpdating={isUpdating}
              onComplete={() => onCompleteItem(item.id)}
            />
          ))}
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
            {status === "pending" ? "รับออร์เดอร์" : "เสร็จทั้งหมด"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
