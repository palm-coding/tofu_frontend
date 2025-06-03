import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order, OrderStatus } from "@/interfaces/order.interface";
import { getTimeAgo, getOrderStatusColors } from "./helpers";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// AnimatedCheckMark component
const AnimatedCheckMark = () => (
  <motion.svg
    className="stroke-green-500 mr-1 h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    strokeWidth="2"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
    <motion.path
      d="M5 13L9 17L19 7"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </motion.svg>
);

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
  order: Order;
  status: OrderStatus;
  borderColorClass: string;
  nextStatus?: OrderStatus;
  isUpdating: boolean;
  onCompleteItem: (itemId: string) => void;
  onMoveOrder: () => void;
  getItemId: (orderId: string, index: number) => string;
}) {
  // เพิ่ม state เพื่อเก็บรายการที่เพิ่งกด Complete
  const [justCompletedItems, setJustCompletedItems] = useState<string[]>([]);

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

  // ฟังก์ชันจัดการเมื่อกดปุ่ม Complete
  const handleCompleteItem = (itemId: string) => {
    // เพิ่ม animation และเก็บรายการที่เพิ่งกด Complete
    setJustCompletedItems((prev) => [...prev, itemId]);

    // เรียกฟังก์ชันเดิม แต่หน่วงเวลาเล็กน้อยเพื่อให้ animation แสดง
    setTimeout(() => {
      onCompleteItem(itemId);

      // หลังจาก animation ให้ลบออกจาก justCompletedItems
      setTimeout(() => {
        setJustCompletedItems((prev) => prev.filter((id) => id !== itemId));
      }, 1000);
    }, 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        key={order._id}
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

              // เช็คว่าเป็นรายการที่เพิ่งกด Complete หรือไม่
              const isJustCompleted = justCompletedItems.includes(itemId);

              return (
                <motion.li
                  key={itemId}
                  className="flex justify-between items-center"
                  initial={false}
                  animate={
                    item.status === "served"
                      ? { backgroundColor: "rgba(236, 253, 243, 0.5)" }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={
                      isJustCompleted
                        ? {
                            scale: [1, 1.02, 1],
                            opacity: item.status === "served" ? 0.8 : 1,
                          }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <span
                      className={cn(
                        "font-medium",
                        item.status === "served" &&
                          "line-through text-muted-foreground"
                      )}
                    >
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
                  </motion.div>
                  {status === "preparing" && (
                    <AnimatePresence mode="wait">
                      {item.status === "served" ? (
                        <motion.div
                          className="flex items-center rounded-md bg-accent/30 px-2 py-1 text-xs"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AnimatedCheckMark />
                          <span>เสร็จแล้ว</span>
                        </motion.div>
                      ) : isUpdating && isJustCompleted ? (
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "rounded-md border border-input bg-background px-4 py-1 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground",
                            (item.status as string) === "served" &&
                              "bg-accent/30"
                          )}
                          onClick={() => handleCompleteItem(itemId)}
                          disabled={
                            (item.status as string) === "served" || isUpdating
                          }
                        >
                          เสร็จ
                        </motion.button>
                      )}
                    </AnimatePresence>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </CardContent>
        {nextStatus && (
          <CardFooter>
            <motion.button
              className={cn(
                "w-full flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors",
                getOrderStatusColors(status).buttonClass
              )}
              onClick={onMoveOrder}
              disabled={isUpdating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isUpdating && (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Loader2 className="h-4 w-4" />
                </motion.div>
              )}
              {status === "received"
                ? "รับออร์เดอร์"
                : status === "preparing"
                ? "เสร็จทั้งหมด"
                : status === "served"
                ? "ชำระเงิน"
                : ""}
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </motion.button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
