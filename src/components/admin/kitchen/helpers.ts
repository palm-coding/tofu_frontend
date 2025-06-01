import { OrderStatus } from "@/interfaces/order.interface";

export const getTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // คำนวณความแตกต่างในหน่วยเวลาต่างๆ
    const diffSecs = Math.floor(diffMs / 1000);

    // เริ่มตรวจสอบจากหน่วยเล็กไปใหญ่
    // น้อยกว่า 60 วินาที
    if (diffSecs < 60) {
      return diffSecs <= 5 ? "เมื่อสักครู่" : `${diffSecs} วินาทีที่แล้ว`;
    }

    // น้อยกว่า 60 นาที
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) {
      return diffMins === 1 ? "1 นาทีที่แล้ว" : `${diffMins} นาทีที่แล้ว`;
    }

    // น้อยกว่า 24 ชั่วโมง
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return diffHours === 1
        ? "1 ชั่วโมงที่แล้ว"
        : `${diffHours} ชั่วโมงที่แล้ว`;
    }

    // น้อยกว่า 7 วัน
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return diffDays === 1 ? "1 วันที่แล้ว" : `${diffDays} วันที่แล้ว`;
    }

    // น้อยกว่า 30 วัน
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) {
      return diffWeeks === 1
        ? "1 สัปดาห์ที่แล้ว"
        : `${diffWeeks} สัปดาห์ที่แล้ว`;
    }

    // มากกว่า 30 วัน
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? "1 เดือนที่แล้ว" : `${diffMonths} เดือนที่แล้ว`;
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
