"use client";

import { OrderDisplay } from "@/components/client/order/order-page";
import { useParams } from "next/navigation";

export default function OrderPageWrapper() {
  // ใช้ useParams hook เพื่อดึงค่า sessionId จาก URL
  const params = useParams();

  // เปลี่ยนจาก params.qrCode เป็น params.sessionId เพื่อให้ตรงกับชื่อไฟล์
  const qrCode = params.sessionId as string;

  return <OrderDisplay qrCode={qrCode} />;
}
