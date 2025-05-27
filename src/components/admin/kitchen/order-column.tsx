import { Badge } from "@/components/ui/badge";
import { Coffee } from "lucide-react";
import { KitchenOrder, OrderStatus } from "@/interfaces/kitchen.interface";
import { OrderCard } from "./order-card";
import { getOrderStatusColors } from "./helpers";
import { cn } from "@/lib/utils";

export function OrderColumn({
  title,
  orders,
  status,
  nextStatus,
  isUpdating,
  onCompleteItem,
  onMoveOrder,
}: {
  title: string;
  orders: KitchenOrder[];
  status: OrderStatus;
  nextStatus?: OrderStatus;
  isUpdating: boolean;
  onCompleteItem: (orderId: string, itemId: string) => void;
  onMoveOrder: (orderId: string, nextStatus: OrderStatus) => void;
}) {
  const { borderColorClass } = getOrderStatusColors(status);

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
          {orders.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 pr-1 custom-scrollbar">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-md p-4">
            <Coffee className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
            <p className="text-muted-foreground text-sm">ไม่มีออร์เดอร์</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              status={status}
              borderColorClass={borderColorClass}
              nextStatus={nextStatus}
              isUpdating={isUpdating}
              onCompleteItem={(itemId) => onCompleteItem(order.id, itemId)}
              onMoveOrder={() => onMoveOrder(order.id, nextStatus!)}
            />
          ))
        )}
      </div>
    </div>
  );
}
