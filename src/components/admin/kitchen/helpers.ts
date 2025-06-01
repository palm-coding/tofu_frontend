import { OrderStatus } from "@/interfaces/order.interface";

export const getTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // คำนวณความแตกต่างในหน่วยเวลาต่างๆ
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2592000000); // ประมาณ 30 วัน

    // เลือกหน่วยเวลาที่เหมาะสมที่สุด
    if (diffMonths > 0) {
      return diffMonths === 1 ? "1 เดือนที่แล้ว" : `${diffMonths} เดือนที่แล้ว`;
    } else if (diffWeeks > 0) {
      return diffWeeks === 1
        ? "1 สัปดาห์ที่แล้ว"
        : `${diffWeeks} สัปดาห์ที่แล้ว`;
    } else if (diffDays > 0) {
      return diffDays === 1 ? "1 วันที่แล้ว" : `${diffDays} วันที่แล้ว`;
    } else if (diffHours > 0) {
      return diffHours === 1
        ? "1 ชั่วโมงที่แล้ว"
        : `${diffHours} ชั่วโมงที่แล้ว`;
    } else if (diffMins > 0) {
      return diffMins === 1 ? "1 นาทีที่แล้ว" : `${diffMins} นาทีที่แล้ว`;
    } else if (diffSecs > 0) {
      return diffSecs === 1 ? "1 วินาทีที่แล้ว" : `${diffSecs} วินาทีที่แล้ว`;
    } else {
      return "เมื่อสักครู่";
    }
  } catch {
    return "ไม่ทราบเวลา";
  }
};

export const getOrderStatusColors = (status: OrderStatus) => {
  switch (status) {
    case "received":
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
    case "paid":
      return {
        borderColorClass: "border-gray-500 dark:border-gray-400",
        buttonClass:
          "bg-gray-500 hover:bg-gray-600 dark:bg-gray-400 dark:hover:bg-gray-500 text-white",
      };
    default:
      return {
        borderColorClass: "border-border",
        buttonClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
      };
  }
};
