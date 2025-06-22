import { useState, useEffect, useCallback } from "react";
import { webSocketService } from "@/services/websocket.service";
import { Order } from "@/interfaces/order.interface";
import { Payment } from "@/interfaces/payment.interface";
import { SessionCheckoutEvent } from "@/interfaces/websocket.interface";

interface UseOrdersSocketOptions {
  branchId?: string;
  orderId?: string;
  sessionId?: string;
  onNewOrder?: (order: Order) => void;
  onOrderStatusChanged?: (order: Order) => void;
  onPaymentStatusChanged?: (payment: Payment) => void;
  onSessionCheckout?: (session: SessionCheckoutEvent) => void;
  onError?: (error: Error) => void;
}

export function useOrdersSocket({
  branchId,
  orderId,
  sessionId,
  onNewOrder,
  onOrderStatusChanged,
  onPaymentStatusChanged,
  onSessionCheckout,
  onError,
}: UseOrdersSocketOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isBranchJoined, setIsBranchJoined] = useState<boolean>(false);
  const [isOrderRoomJoined, setIsOrderRoomJoined] = useState<boolean>(false);
  const [isSessionJoined, setIsSessionJoined] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // รับข้อมูล order ใหม่
  const handleNewOrder = useCallback(
    (eventData: unknown) => {
      const order = eventData as Order;
      console.log("New order received via WebSocket:", order);
      if (onNewOrder) {
        onNewOrder(order);
      }
    },
    [onNewOrder]
  );

  // รับข้อมูล order ที่มีการเปลี่ยนสถานะ
  const handleOrderStatusChanged = useCallback(
    (eventData: unknown) => {
      const order = eventData as Order;
      console.log("Order status changed via WebSocket:", order);
      if (onOrderStatusChanged) {
        onOrderStatusChanged(order);
      }
    },
    [onOrderStatusChanged]
  );

  // เพิ่ม handler สำหรับการเปลี่ยนสถานะการชำระเงิน
  const handlePaymentStatusChanged = useCallback(
    (eventData: unknown) => {
      const payment = eventData as Payment;
      console.log("Payment status changed via WebSocket:", payment);
      if (onPaymentStatusChanged) {
        onPaymentStatusChanged(payment);
      }
    },
    [onPaymentStatusChanged]
  );

  // เพิ่ม handler สำหรับ session checkout
  const handleSessionCheckout = useCallback(
    (eventData: unknown) => {
      // ส่ง data โดยตรงไม่ต้องห่อด้วย session property เพื่อให้ตรงกับการใช้งานจริง
      console.log("Session checkout notification via WebSocket:", eventData);

      if (onSessionCheckout) {
        onSessionCheckout(eventData as SessionCheckoutEvent);
      }
    },
    [onSessionCheckout]
  );

  // เชื่อมต่อกับ WebSocket และตั้งค่า event listeners
  useEffect(() => {
    try {
      const socket = webSocketService.connect();

      // ตั้งค่า listeners สำหรับสถานะการเชื่อมต่อ
      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => {
        setIsConnected(false);
        setIsBranchJoined(false);
      };
      const onConnectError = (err: Error) => {
        setError(err);
        if (onError) onError(err);
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("connect_error", onConnectError);

      // ตั้งค่า listeners สำหรับ orders events
      const newOrderUnsubscribe = webSocketService.on(
        "newOrder",
        handleNewOrder
      );
      const orderStatusChangedUnsubscribe = webSocketService.on(
        "orderStatusChanged",
        handleOrderStatusChanged
      );

      const paymentStatusChangedUnsubscribe = webSocketService.on(
        "paymentStatusChanged",
        handlePaymentStatusChanged
      );

      const sessionCheckoutUnsubscribe = webSocketService.on(
        "sessionCheckout",
        handleSessionCheckout
      );

      // ตรวจสอบสถานะการเชื่อมต่อปัจจุบัน
      setIsConnected(socket.connected);

      // Cleanup function
      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("connect_error", onConnectError);
        newOrderUnsubscribe();
        orderStatusChangedUnsubscribe();
        paymentStatusChangedUnsubscribe();
        sessionCheckoutUnsubscribe();
      };
    } catch (err) {
      console.error("Failed to initialize WebSocket:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      if (onError && err instanceof Error) onError(err);
      return () => {};
    }
  }, [
    handleNewOrder,
    handleOrderStatusChanged,
    handlePaymentStatusChanged,
    handleSessionCheckout,
    onError,
  ]);

  // เข้าร่วม/ออกจาก branch room เมื่อ branchId เปลี่ยนแปลง
  useEffect(() => {
    if (!isConnected || !branchId) {
      setIsBranchJoined(false);
      return () => {};
    }

    let isMounted = true;

    // Join branch room
    webSocketService
      .joinBranchRoom(branchId)
      .then(() => {
        if (isMounted) setIsBranchJoined(true);
      })
      .catch((err) => {
        console.error("Failed to join branch room:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          if (onError && err instanceof Error) onError(err);
        }
      });

    // Cleanup: leave branch room when component unmounts or branchId changes
    return () => {
      isMounted = false;
      if (branchId && isConnected) {
        webSocketService.leaveBranchRoom(branchId).catch((err) => {
          console.error("Failed to leave branch room:", err);
        });
      }
    };
  }, [branchId, isConnected, onError]);

  // เพิ่ม useEffect สำหรับการเข้าร่วม/ออกจาก order room
  useEffect(() => {
    if (!isConnected || !orderId) {
      setIsOrderRoomJoined(false);
      return () => {};
    }

    let isMounted = true;

    // Join order room
    webSocketService
      .joinOrderRoom(orderId)
      .then(() => {
        if (isMounted) setIsOrderRoomJoined(true);
      })
      .catch((err) => {
        console.error("Failed to join order room:", err);
        if (isMounted && onError && err instanceof Error) onError(err);
      });

    // Cleanup
    return () => {
      isMounted = false;
      if (orderId && isConnected) {
        webSocketService.leaveOrderRoom(orderId).catch((err) => {
          console.error("Failed to leave order room:", err);
        });
      }
    };
  }, [orderId, isConnected, onError]);

  // เพิ่ม useEffect สำหรับการเข้าร่วม/ออกจาก session room
  useEffect(() => {
    if (!isConnected || !sessionId) {
      setIsSessionJoined(false);
      return () => {};
    }

    let isMounted = true;

    // Join session room
    webSocketService
      .joinSessionRoom(sessionId)
      .then(() => {
        if (isMounted) setIsSessionJoined(true);
      })
      .catch((err) => {
        console.error("Failed to join session room:", err);
        if (isMounted && onError && err instanceof Error) onError(err);
      });

    // Cleanup
    return () => {
      isMounted = false;
      if (sessionId && isConnected) {
        webSocketService.leaveSessionRoom(sessionId).catch((err) => {
          console.error("Failed to leave session room:", err);
        });
      }
    };
  }, [sessionId, isConnected, onError]);

  // ฟังก์ชันสำหรับตัดการเชื่อมต่อ WebSocket (สำหรับให้ component เรียกใช้ถ้าต้องการ)
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
    setIsBranchJoined(false);
    setIsOrderRoomJoined(false);
    setIsSessionJoined(false);
  }, []);

  return { isConnected, isBranchJoined, isOrderRoomJoined, isSessionJoined, error, disconnect };
}
