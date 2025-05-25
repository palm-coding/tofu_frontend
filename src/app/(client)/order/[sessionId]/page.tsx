"use client";

import { OrderDisplay } from "@/components/client/order/order-page";
import { useParams } from "next/navigation";

export default function OrderPageWrapper() {
  // ใช้ useParams hook เพื่อดึงค่า sessionId จาก URL
  const params = useParams();
  const sessionId = params.sessionId as string;

  return <OrderDisplay sessionId={sessionId} />;
}
