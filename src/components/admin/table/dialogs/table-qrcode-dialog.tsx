import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { X, ExternalLink } from "lucide-react";
import { TableDisplay } from "@/interfaces/table.interface";

interface TableQrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTable: TableDisplay | null;
  getOrderUrl: () => string;
  qrCode?: string;
}

export function TableQrCodeDialog({
  open,
  onOpenChange,
  selectedTable,
  getOrderUrl,
  qrCode,
}: TableQrCodeDialogProps) {
  // เก็บ URL ไว้ในตัวแปรเพื่อใช้งานหลายที่
  const orderUrl = getOrderUrl();
  
  const openInNewTab = () => {
    window.open(orderUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center text-foreground">
            QR Code สำหรับสั่งอาหาร
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {selectedTable?.name} - ให้ลูกค้าสแกน QR Code นี้เพื่อสั่งอาหาร
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-popover p-6 rounded-2xl shadow-lg border border-border">
            <QRCodeSVG
              value={orderUrl}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          
          {/* แก้ไขจาก <p> เป็น Button ที่คลิกได้ */}
          <Button 
            variant="outline" 
            onClick={openInNewTab}
            className="mt-6 text-sm text-muted-foreground max-w-xs flex items-center gap-2 hover:text-foreground hover:bg-accent transition-all"
          >
            <span className="truncate">{orderUrl}</span>
            <ExternalLink className="h-4 w-4" />
          </Button>

          {/* แสดงข้อความแจ้งเตือนถ้าไม่มี QR Code */}
          {!qrCode && (
            <p className="mt-2 text-orange-500 text-sm text-center">
              หมายเหตุ: ไม่พบรหัส QR ในระบบ กำลังใช้ URL สำรอง
            </p>
          )}

          {qrCode && (
            <p className="mt-2 text-sm text-center font-medium text-muted-foreground">
              รหัส QR: {qrCode}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            <X className="mr-2 h-4 w-4" />
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}