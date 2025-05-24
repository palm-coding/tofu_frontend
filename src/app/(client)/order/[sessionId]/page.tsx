"use client";

import { OrderDisplay } from "@/components/client/order/order-page";

export default function OrderPageWrapper({
  params,
}: {
  params: { sessionId: string };
}) {
  return <OrderDisplay sessionId={params.sessionId} />;
}
