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
import { X } from "lucide-react";
import { TableItem } from "@/interfaces/table.interface";

interface TableQrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTable: TableItem | null;
  getOrderUrl: (sessionId: string) => string;
  generateSessionId: () => string;
}

export function TableQrCodeDialog({
  open,
  onOpenChange,
  selectedTable,
  getOrderUrl,
  generateSessionId,
}: TableQrCodeDialogProps) {
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
              value={getOrderUrl(
                selectedTable?.sessionId || generateSessionId()
              )}
              size={200}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <p className="mt-6 text-sm text-center text-muted-foreground max-w-xs break-all">
            {getOrderUrl(selectedTable?.sessionId || generateSessionId())}
          </p>
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
