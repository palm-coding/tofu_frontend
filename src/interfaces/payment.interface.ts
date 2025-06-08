/**
 * Payment method options
 */
export type PaymentMethod = "cash" | "promptpay" | "card";

/**
 * Payment status options
 */
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

/**
 * Interface for payment data
 */
export interface Payment {
  _id?: string;
  branchId: string;
  orderId: string;
  sessionId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  sourceId?: string;
  transactionId?: string;
  paymentDetails?: Record<string, unknown>;
  qrCodeImage?: string;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface for creating a new payment
 */
export interface CreatePaymentDto {
  branchId: string;
  orderId: string;
  sessionId: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  sourceId?: string;
  transactionId?: string;
  paymentDetails?: Record<string, unknown>;
  qrCodeImage?: string;
  expiresAt?: Date;
}

/**
 * Interface สำหรับการรับข้อมูลการชำระเงินผ่าน PromptPay
 * ใช้สำหรับการสร้างการชำระเงินด้วย QR code PromptPay
 */
export interface PromptPayPaymentDto {
  branchId: string;
  orderId: string;
  sessionId: string;
  amount: number;
  metadata?: Record<string, unknown>;
}
