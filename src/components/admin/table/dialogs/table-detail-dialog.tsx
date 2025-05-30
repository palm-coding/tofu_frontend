import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  CreditCard,
  QrCode,
  Receipt,
  ShoppingCart,
  X,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { TableDisplay } from "@/interfaces/table.interface";
import { Session } from "@/interfaces/session.interface";
import { OrderLine, Order } from "@/interfaces/order.interface";
import { orderService } from "@/services/order/order.service";

interface TableDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTable: TableDisplay | null;
  session?: Session | null;
  isPaid: boolean;
  isSessionLoading?: boolean;
  onMarkAsPaid: () => void;
  onCheckout: (tableId: string) => void;
  onShowQR: (table: TableDisplay) => void;
  getTimeAgo: (dateString: string) => string;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
  calculateTableTotal: (table: TableDisplay | null) => number;
}

export function TableDetailDialog({
  open,
  onOpenChange,
  selectedTable,
  session,
  isPaid,
  isSessionLoading = false,
  onMarkAsPaid,
  onCheckout,
  onShowQR,
  getTimeAgo,
  getStatusText,
  getStatusColor,
}: TableDetailDialogProps) {
  console.log(
    "TableDetailDialog rendered with session:",
    JSON.stringify(session, null, 2)
  );

  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders when dialog opens with session data
  useEffect(() => {
    async function fetchOrders() {
      if (!open || !selectedTable) return;

      setLoading(true);
      setError(null);

      try {
        // If we have a session with ID, use it to fetch orders
        if (session && session._id) {
          console.log("Fetching orders for session ID:", session._id);
          const ordersData = await orderService.getOrdersForSession(
            session._id
          );
          console.log(
            "Orders fetched by session:",
            JSON.stringify(ordersData, null, 2)
          );
          setOrders(ordersData);
        } else {
          console.log("No orders available");
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("ไม่สามารถดึงข้อมูลออร์เดอร์ได้");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [open, selectedTable, session]);

  // Calculate total for all orders
  const calculateOrdersTotal = () => {
    return orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full min-w-[200px] max-w-[95vw] lg:max-w-[80vw] max-h-[90vh] mx-auto bg-background border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-foreground">
            รายละเอียด {selectedTable?.name || "โต๊ะ"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            เช็คอินเมื่อ: {selectedTable?.checkinTime || "ไม่ระบุ"} | ลูกค้า:{" "}
            {selectedTable?.customerName || "ไม่ระบุ"}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isSessionLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">
                กำลังโหลดข้อมูล session...
              </p>
            </div>
          </div>
        )}

        <ScrollArea className="max-h-[60vh] custom-scrollbar">
          <div className="p-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-auto">
              {/* Left side - Order details */}
              <div className="space-y-6">
                <h3 className="text-xl font-light text-foreground">
                  รายการอาหาร
                </h3>

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                )}

                {/* Error Message */}
                {!loading && error && (
                  <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
                    <p>{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Orders List - Using dynamically fetched orders */}
                  {!loading && orders.length > 0
                    ? orders.map((order, index) => (
                        <div
                          key={order._id}
                          className="bg-muted dark:bg-muted/50 rounded-xl p-6 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-foreground">
                              ออร์เดอร์ #{index + 1}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border-0 font-medium",
                                getStatusColor(order.status)
                              )}
                            >
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            สั่งโดย: {order.orderBy || "ไม่ระบุ"} | สั่งเมื่อ:{" "}
                            {getTimeAgo(order.createdAt)}
                          </p>

                          <div className="space-y-3">
                            {order.orderLines &&
                              order.orderLines.map(
                                (item: OrderLine, lineIndex: number) => {
                                  // ตรวจสอบว่า menuItemId เป็น object หรือ string
                                  const menuItemName =
                                    typeof item.menuItemId === "object" &&
                                    item.menuItemId
                                      ? item.menuItemId.name
                                      : "ไม่ระบุรายการ";

                                  const menuItemPrice =
                                    typeof item.menuItemId === "object" &&
                                    item.menuItemId
                                      ? item.menuItemId.price
                                      : 0;

                                  const quantity =
                                    item.qty || item.quantity || 1;

                                  return (
                                    <div
                                      key={`${order._id}-line-${lineIndex}`}
                                      className="flex justify-between items-start py-2"
                                    >
                                      <div className="flex-1">
                                        <span className="font-medium text-foreground">
                                          {menuItemName}
                                        </span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                          x{quantity}
                                        </span>
                                        {item.note && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            หมายเหตุ: {item.note}
                                          </p>
                                        )}
                                      </div>
                                      <span className="font-medium text-foreground">
                                        ฿{menuItemPrice * quantity}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            <Separator className="my-3" />
                            <div className="flex justify-between font-semibold text-lg">
                              <span className="text-foreground">รวม</span>
                              <span className="text-foreground">
                                ฿{order.totalAmount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    : !loading && (
                        <div className="py-12 text-center">
                          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground text-lg">
                            ยังไม่มีออร์เดอร์
                          </p>
                        </div>
                      )}
                </div>
              </div>

              {/* Right side - Payment and QR code */}
              <div className="space-y-6">
                {/* สรุปรายการ */}
                <div className="bg-muted dark:bg-muted/50 rounded-xl p-6">
                  <h3 className="text-xl font-light text-foreground mb-6">
                    สรุปรายการ
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        จำนวนออร์เดอร์:
                      </span>
                      <span className="font-medium text-foreground">
                        {orders.length} รายการ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        จำนวนที่นั่ง:
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedTable?.capacity || 0} ที่นั่ง
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        ระยะเวลาที่ใช้:
                      </span>
                      <span className="font-medium text-foreground">
                        {selectedTable?.checkinTime
                          ? getTimeAgo(
                              new Date(
                                new Date().setHours(
                                  Number.parseInt(
                                    selectedTable.checkinTime.split(":")[0]
                                  ),
                                  Number.parseInt(
                                    selectedTable.checkinTime.split(":")[1]
                                  )
                                )
                              ).toISOString()
                            )
                          : "-"}
                      </span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-xl font-semibold">
                      <span className="text-foreground">ยอดรวมทั้งสิ้น:</span>
                      <span className="text-foreground">
                        ฿{calculateOrdersTotal()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* การชำระเงิน */}
                <div className="bg-muted dark:bg-muted/50 rounded-xl p-6">
                  {isPaid ? (
                    <div className="text-center py-8">
                      <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-10 w-10" />
                      </div>
                      <p className="text-green-700 dark:text-green-100 font-medium text-lg">
                        ชำระเงินเรียบร้อยแล้ว
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        สามารถเช็คเอาท์โต๊ะได้
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center mb-6">
                        <div className="bg-popover p-4 rounded-xl shadow-lg border border-border mb-4">
                          <QRCodeSVG
                            value={`https://promptpay.io/0812345678/${calculateOrdersTotal()}`}
                            size={150}
                            level="H"
                            includeMargin={true}
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                          สแกน QR Code เพื่อชำระเงินด้วย PromptPay
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                        <Button
                          variant="outline"
                          onClick={onMarkAsPaid}
                          disabled={!orders.length || isSessionLoading}
                          className="border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          บันทึกการชำระเงิน
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            selectedTable && onShowQR(selectedTable)
                          }
                          disabled={isSessionLoading}
                          className="border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          แสดง QR สั่งอาหาร
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-6 border-t border-border">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <X className="mr-2 h-4 w-4" />
              ปิด
            </Button>
            <Button
              onClick={() => selectedTable && onCheckout(selectedTable._id)}
              disabled={(!isPaid && orders.length > 0) || isSessionLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
            >
              <Receipt className="mr-2 h-4 w-4" />
              เช็คเอาท์
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
