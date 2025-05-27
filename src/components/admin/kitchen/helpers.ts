import { OrderStatus } from "@/interfaces/kitchen.interface";

export const getTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins === 1) return "1 นาทีที่แล้ว";
    return `${diffMins} นาทีที่แล้ว`;
  } catch {
    return "ไม่ทราบเวลา";
  }
};

export const getOrderStatusColors = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return {
        borderColor: "var(--chart-4)",
        buttonClass:
          "bg-[var(--chart-4)] text-primary-foreground hover:bg-[var(--chart-4)]/90",
      };
    case "preparing":
      return {
        borderColor: "var(--chart-2)",
        buttonClass:
          "bg-[var(--chart-2)] text-primary-foreground hover:bg-[var(--chart-2)]/90",
      };
    case "served":
      return {
        borderColor: "var(--chart-3)",
        buttonClass:
          "bg-[var(--chart-3)] text-primary-foreground hover:bg-[var(--chart-3)]/90",
      };
    default:
      return {
        borderColor: "var(--border)",
        buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90",
      };
  }
};
