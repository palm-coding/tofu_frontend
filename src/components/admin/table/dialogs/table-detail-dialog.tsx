import { useState, useEffect } from "react";
import Image from "next/image";
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
  Wallet,
  RefreshCw,
  AlertCircle,
  Clock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { TableDisplay } from "@/interfaces/table.interface";
import { Session } from "@/interfaces/session.interface";
import { OrderLine, Order } from "@/interfaces/order.interface";
import { orderService } from "@/services/order/order.service";
import { paymentService } from "@/services/payment/payment.service";
import { Payment } from "@/interfaces/payment.interface";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getExpirationTime } from "../utils/table-helper";

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
  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State to control payment QR code visibility
  const [showPaymentQR, setShowPaymentQR] = useState<boolean>(false);
  // State to track if QR was regenerated (for animation effects)
  const [qrKey, setQrKey] = useState<number>(0);

  // New state for payment processing
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Reset all state when the dialog opens or table/session changes
  useEffect(() => {
    // Clear previous state when dialog opens for a new table
    if (open) {
      console.log("Dialog opened for new table, resetting state");
      setOrders([]);
      setError(null);
      setPaymentError(null);
      // Don't reset QR code display state here - it will be determined by fetchExistingPayment
    } else {
      // When dialog closes, reset all states
      setOrders([]);
      setShowPaymentQR(false);
      setCurrentPayment(null);
      setError(null);
      setPaymentError(null);
    }
  }, [open, selectedTable?._id, session?._id]);

  // Fetch orders when dialog opens with session data
  useEffect(() => {
    async function fetchOrders() {
      if (!open || !selectedTable || !session?._id) return;

      setLoading(true);

      try {
        console.log(
          `Fetching orders for session: ${session._id}, table: ${selectedTable.name}`
        );
        const ordersData = await orderService.getOrdersForSession(session._id);

        // Log to debug what's coming back from the API
        console.log(
          "Orders fetched for session:",
          JSON.stringify(ordersData, null, 2)
        );

        // Ensure we're getting an array, and it's properly set to state
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          console.error("Expected array of orders but got:", typeof ordersData);
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("ไม่สามารถดึงข้อมูลออร์เดอร์ได้");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [open, selectedTable, session]);

  // Fetch existing payment data when dialog opens
  useEffect(() => {
    async function fetchExistingPayment() {
      if (!open || !session?._id) return; // Remove isPaid check to always fetch the latest payment

      try {
        console.log(`Checking payment for session: ${session._id}`);

        // ดึงข้อมูลการชำระเงินทั้งหมดของ session นี้
        const paymentsResponse = await paymentService.getPaymentsBySession(
          session._id
        );

        console.log(
          `Payments fetched for session ${session._id}:`,
          JSON.stringify(paymentsResponse, null, 2)
        );

        // ตรวจสอบว่าข้อมูลที่ได้รับเป็นอาร์เรย์หรือไม่
        const payments = Array.isArray(paymentsResponse)
          ? paymentsResponse
          : [];

        // เลือกเฉพาะรายการล่าสุด แทนที่จะกรอง
        const latestPayment =
          payments.length > 0
            ? payments.sort(
                (a, b) =>
                  new Date(b.createdAt || 0).getTime() -
                  new Date(a.createdAt || 0).getTime()
              )[0]
            : null;

        console.log(
          `Found ${payments.length} payments, using latest payment for session ${session._id}`
        );

        if (latestPayment) {
          console.log(
            "Latest payment data:",
            JSON.stringify(latestPayment, null, 2)
          );

          // ตั้งค่า payment และแสดง QR โดยไม่ตรวจสอบสถานะ
          setCurrentPayment(latestPayment);
          console.log("Current payment status:", latestPayment.status);

          // แสดง QR เสมอถ้าไม่ได้ถูกมาร์คว่าชำระแล้ว
          if (!isPaid) {
            setShowPaymentQR(true);
            setQrKey((prevKey) => prevKey + 1); // Force re-render of QR
          }
        } else {
          // ถ้าไม่พบการชำระเงิน ให้รีเซ็ตสถานะ
          console.log("No payment found for session:", session._id);
          setShowPaymentQR(false);
          setCurrentPayment(null);
        }
      } catch (err) {
        console.error("Error fetching payment:", err);
        setShowPaymentQR(false);
        setCurrentPayment(null);
      }
    }

    fetchExistingPayment();
  }, [open, session?._id, isPaid, selectedTable?.name]);

  // Calculate total for all orders - make sure we're using the current orders
  const calculateOrdersTotal = () => {
    // Add extra safety check and logging
    if (!orders || !Array.isArray(orders)) {
      console.warn("Orders is not an array when calculating total", orders);
      return 0;
    }

    // ถ้าไม่ได้กำหนดให้แสดงผลรวมของทั้งหมด ให้แสดงเป็นรายออร์เดอร์
    // จัดเรียงจากใหม่ไปเก่า และเลือกเฉพาะออร์เดอร์ที่ยังไม่ได้ชำระเงิน
    const sortedOrders = [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((order) => order.status !== "paid");

    // หากมีมากกว่า 1 ออร์เดอร์ ให้แสดงเฉพาะออร์เดอร์ล่าสุดที่ยังไม่ได้ชำระเงิน
    if (sortedOrders.length > 0) {
      const latestOrder = sortedOrders[0];
      const amount = latestOrder?.totalAmount || 0;

      console.log(
        `Using latest order (${latestOrder._id}) amount: ${amount} baht for table ${selectedTable?.name}`
      );

      return amount;
    }

    // ถ้าไม่มีออร์เดอร์ที่ยังไม่ได้ชำระเงิน ก็คืน 0
    return 0;
  };

  // Handle QR code generation with real payment
  const handleQRCodeGeneration = async () => {
    // Validate required data
    if (!selectedTable?.branchId || !session?._id) {
      setPaymentError("ไม่มีข้อมูลเพียงพอสำหรับการสร้าง QR Code ชำระเงิน");
      return;
    }

    if (orders.length === 0) {
      setPaymentError("ไม่พบออร์เดอร์สำหรับการชำระเงิน");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // Find first unpaid order to associate with payment
      const unpaidOrder = orders.find((order) => order.status !== "paid");

      if (!unpaidOrder) {
        setPaymentError("ไม่พบออร์เดอร์ที่รอการชำระเงิน");
        setPaymentLoading(false);
        return;
      }

      // Format members information for metadata
      const memberNames =
        session.members?.map((member) => member.userLabel).join(", ") ||
        "ไม่ระบุ";
      const memberCount = session.members?.length || 0;

      // Calculate the correct total for this table
      const tableTotal = calculateOrdersTotal();

      // Create payment data for API
      const paymentData = {
        branchId: selectedTable.branchId,
        orderId: unpaidOrder._id,
        sessionId: session._id,
        amount: tableTotal,
        metadata: {
          tableName: selectedTable.name,
          members: memberNames,
          memberCount: memberCount,
          checkinAt: session.checkinAt,
        },
      };

      console.log(
        `Generating payment QR for table ${selectedTable.name} with amount: ${tableTotal} baht`,
        JSON.stringify(paymentData, null, 2)
      );

      // Call API to generate QR code
      const payment = await paymentService.createPromptPayQR(paymentData);

      // Update state with payment data
      setCurrentPayment(payment);
      setShowPaymentQR(true);

      // Increment QR key to force re-render effect
      setQrKey((prevKey) => prevKey + 1);

      console.log("Generated payment:", JSON.stringify(payment, null, 2));
    } catch (err) {
      console.error("Error generating payment QR:", err);
      setPaymentError("ไม่สามารถสร้าง QR Code ชำระเงินได้");
      // Keep showing previous QR if we had one
      if (!currentPayment) {
        setShowPaymentQR(false);
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // Helper function to get payment status badge color
  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-400 text-white";

    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-500 text-white";
      case "paid":
      case "successful":
        return "bg-green-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      case "expired":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Helper function to get payment status icon
  const getPaymentStatusIcon = (status: string | undefined) => {
    if (!status) return <Clock className="w-3 h-3 mr-1" />;

    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-3 h-3 mr-1" />;
      case "paid":
      case "successful":
        return <Check className="w-3 h-3 mr-1" />;
      case "failed":
        return <X className="w-3 h-3 mr-1" />;
      case "expired":
        return <AlertCircle className="w-3 h-3 mr-1" />;
      default:
        return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  // Helper function to get formatted payment status text
  const getPaymentStatusText = (status: string | undefined) => {
    if (!status) return "รอดำเนินการ";

    switch (status.toLowerCase()) {
      case "pending":
        return "รอชำระเงิน";
      case "paid":
      case "successful":
        return "ชำระเงินแล้ว";
      case "failed":
        return "ชำระเงินไม่สำเร็จ";
      case "expired":
        return "QR Code หมดอายุ";
      default:
        return status;
    }
  };

  // ตรวจสอบว่ามีออร์เดอร์ที่ยังไม่ได้ชำระเงินหรือไม่
  const hasUnpaidOrders = orders.some((order) => order.status !== "paid");

  // ตรวจสอบว่า payment ปัจจุบันเป็น "paid" หรือ "successful" หรือไม่
  const isPaymentSuccessful =
    currentPayment?.status === "paid" ||
    currentPayment?.status === "successful" ||
    (currentPayment?.paymentDetails &&
      (currentPayment?.paymentDetails as any)?.status === "successful");

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
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-light text-foreground">
                      สรุปรายการ
                    </h3>
                    {/* Badge แสดงสถานะการชำระเงิน */}
                    {orders.length > 0 && (
                      <Badge
                        className={cn(
                          "text-xs py-1 px-3",
                          isPaid || isPaymentSuccessful
                            ? "bg-green-500 hover:bg-green-500 text-white"
                            : hasUnpaidOrders
                            ? "bg-amber-500 hover:bg-amber-500 text-white"
                            : "bg-green-500 hover:bg-green-500 text-white"
                        )}
                      >
                        {isPaid || isPaymentSuccessful ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : hasUnpaidOrders ? (
                          <Clock className="w-3 h-3 mr-1" />
                        ) : (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {isPaid || isPaymentSuccessful
                          ? "ชำระแล้ว"
                          : hasUnpaidOrders
                          ? "รอชำระเงิน"
                          : "ชำระแล้ว"}
                      </Badge>
                    )}
                  </div>
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
                        ฿{currentPayment?.amount || calculateOrdersTotal()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* การชำระเงิน */}
                <div className="bg-muted dark:bg-muted/50 rounded-xl p-6">
                  {isPaid || isPaymentSuccessful ? (
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
                      {/* Show payment error if any */}
                      {paymentError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{paymentError}</AlertDescription>
                        </Alert>
                      )}

                      {/* Show payment QR code when it's ready */}
                      {showPaymentQR ? (
                        <div className="flex flex-col items-center mb-6">
                          {paymentLoading ? (
                            <div className="flex flex-col items-center py-8">
                              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                              <p className="text-muted-foreground">
                                กำลังสร้าง QR Code...
                              </p>
                            </div>
                          ) : (
                            <>
                              <div
                                key={`payment-qr-${qrKey}`}
                                className="bg-popover p-4 rounded-xl shadow-lg border border-border mb-4 transition-all duration-300"
                              >
                                {/* Use the download_uri from nested structure in paymentDetails */}
                                {currentPayment?.paymentDetails ? (
                                  <div className="relative w-[180px] h-[180px] mx-auto">
                                    <Image
                                      src={
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (currentPayment.paymentDetails as any)
                                          ?.source?.scannable_code?.image
                                          ?.download_uri ||
                                        currentPayment.qrCodeImage
                                      }
                                      alt="PromptPay QR Code"
                                      fill
                                      sizes="180px"
                                      className="object-contain"
                                      priority
                                      unoptimized={true} // Keep this to ensure the URL isn't modified
                                    />
                                  </div>
                                ) : (
                                  // Fallback QR code if no image URL is available
                                  <QRCodeSVG
                                    value={`https://promptpay.io/0812345678/${
                                      currentPayment?.amount ||
                                      calculateOrdersTotal()
                                    }`}
                                    size={150}
                                    level="H"
                                    includeMargin={true}
                                    fgColor="#000000"
                                    bgColor="#ffffff"
                                  />
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-center text-muted-foreground mb-1">
                                  สแกน QR Code เพื่อชำระเงิน
                                </p>
                                <p className="font-semibold text-primary mb-2">
                                  ฿
                                  {currentPayment?.amount ||
                                    calculateOrdersTotal()}{" "}
                                  บาท
                                </p>
                                {currentPayment?.expiresAt && (
                                  <p className="text-xs text-amber-500">
                                    QR Code จะหมดอายุใน{" "}
                                    {getExpirationTime(
                                      currentPayment.expiresAt.toString()
                                    )}
                                  </p>
                                )}

                                {/* เพิ่ม Badge แสดงสถานะการชำระเงิน */}
                                <Badge
                                  className={cn(
                                    "mt-2 py-1 px-3",
                                    getPaymentStatusColor(
                                      currentPayment?.status
                                    )
                                  )}
                                >
                                  {getPaymentStatusIcon(currentPayment?.status)}
                                  {getPaymentStatusText(currentPayment?.status)}
                                </Badge>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 mb-2">
                          <p className="text-lg font-medium text-foreground mb-2">
                            การชำระเงิน
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            กรุณาแสดง QR Code เพื่อให้ลูกค้าชำระเงิน
                          </p>
                        </div>
                      )}
                      {/* Action buttons - แก้ไขให้รองรับ md screen */}
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                        <Button
                          variant="outline"
                          onClick={handleQRCodeGeneration}
                          disabled={
                            !orders.length || isSessionLoading || paymentLoading
                          }
                          className="border-primary text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
                        >
                          {paymentLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังสร้าง QR...
                            </>
                          ) : showPaymentQR ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              สร้าง QR ใหม่
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-2 h-4 w-4" />
                              แสดง QR จ่ายเงิน
                            </>
                          )}
                        </Button>

                        <Button
                          variant="default"
                          onClick={onMarkAsPaid}
                          disabled={!orders.length || isSessionLoading}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
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
              disabled={
                (!isPaid && !isPaymentSuccessful && orders.length > 0) ||
                isSessionLoading
              }
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
