import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { KitchenOrder, OrderStatus } from "@/interfaces/kitchen.interface";

export function OrderItemRow({
  item,
  status,
  onComplete,
  isUpdating,
}: {
  item: KitchenOrder["items"][0];
  status: OrderStatus;
  onComplete: () => void;
  isUpdating: boolean;
}) {
  return (
    <li className="flex justify-between items-center">
      <div>
        <span className="font-medium text-card-foreground">{item.name}</span>
        <span className="text-sm text-muted-foreground ml-2">
          x{item.quantity || 0}
        </span>
        {item.note && (
          <p className="text-xs text-muted-foreground">หมายเหตุ: {item.note}</p>
        )}
      </div>
      {status === "preparing" && (
        <Button
          variant="outline"
          size="sm"
          onClick={onComplete}
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
}
