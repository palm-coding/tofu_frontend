import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface LowStockAlertProps {
  count: number;
}

export function LowStockAlert({ count }: LowStockAlertProps) {
  return (
    <Alert variant="destructive" className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-700">
        <strong>แจ้งเตือนสต็อกใกล้หมด:</strong> มี {count}{" "}
        รายการที่ปริมาณต่ำกว่าเกณฑ์ที่กำหนด กรุณาตรวจสอบและเพิ่มสต็อก
      </AlertDescription>
    </Alert>
  );
}
