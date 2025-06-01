import { TableDisplay } from "@/interfaces/table.interface";

/**
 * Returns a string representing how long ago the date was
 */
export const getTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins === 1) return "1 นาทีที่แล้ว";
    return `${diffMins} นาทีที่แล้ว`;
  } catch (error) {
    console.error("Error parsing date:", error);
    return "ไม่ทราบเวลา";
  }
};

/**
 * Returns the Thai text representation of a status
 */
export const getStatusText = (status: string) => {
  switch (status) {
    case "available":
      return "ว่าง";
    case "occupied":
      return "ไม่ว่าง";
    case "waiting":
      return "รอคิว";
    case "seated":
      return "นั่งแล้ว";
    case "received":
      return "รับออร์เดอร์แล้ว";
    case "pending":
      return "รอรับออร์เดอร์";
    case "preparing":
      return "กำลังทำ";
    case "served":
      return "เสิร์ฟแล้ว";
    case "paid":
      return "ชำระเงินแล้ว";
    default:
      return "ไม่ทราบ";
  }
};

/**
 * Returns the CSS class for status colors
 */
export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-500 hover:bg-amber-600 text-white";
    case "preparing":
      return "bg-blue-500 hover:bg-blue-600 text-white";
    case "served":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "waiting":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "seated":
      return "bg-green-500 hover:bg-green-600 text-white";
    case "paid":
      return "bg-emerald-500 hover:bg-emerald-600 text-white";
    default:
      return "";
  }
};

/**
 * Calculates the total amount for a table based on its orders
 */
export const calculateTableTotal = (table: TableDisplay | null) => {
  if (!table || !table.orders || table.orders.length === 0) return 0;
  return table.orders.reduce(
    (total, order) => total + (order.totalAmount || 0),
    0
  );
};

/**
 * Returns the CSS class for table card styling based on status
 */
export const getTableCardStyle = (status: string) => {
  switch (status) {
    case "available":
      return "bg-card border-2 border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600";
    case "occupied":
      return "bg-red-50 dark:bg-accent/20 border-2 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600";
    default:
      return "bg-card border-2 border-border";
  }
};

/**
 * Returns the CSS class for status badge styling based on status
 */
export const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-100 border-green-200 dark:border-green-700";
    case "occupied":
      return "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-100 border-red-200 dark:border-red-700";
    case "waiting":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700";
    case "seated":
      return "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-100 border-green-200 dark:border-green-700";
    case "paid":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100 border-emerald-200 dark:border-emerald-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};
