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
