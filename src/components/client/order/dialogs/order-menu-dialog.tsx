import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MenuItem } from "@/interfaces/menu.interface";
import Image from "next/image";
import { MinusCircle, PlusCircle, ShoppingCart, X } from "lucide-react";

interface OrderMenuDialogProps {
  selectedItem: MenuItem | null;
  itemDialogOpen: boolean;
  setItemDialogOpen: (open: boolean) => void;
  itemQuantity: number;
  setItemQuantity: (quantity: number) => void;
  itemNote: string;
  setItemNote: (note: string) => void;
  handleAddItemToCart: () => void;
}

export function OrderMenuDialog({
  selectedItem,
  itemDialogOpen,
  setItemDialogOpen,
  itemQuantity,
  setItemQuantity,
  itemNote,
  setItemNote,
  handleAddItemToCart,
}: OrderMenuDialogProps) {
  if (!selectedItem) return null;

  return (
    <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] bg-background border-0 shadow-2xl"
        autoFocus={false}
        onInteractOutside={(e) => {
          // ป้องกันการแสดง keyboard เมื่อกดด้านนอก dialog
          e.preventDefault();
        }}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-light text-foreground">
            {selectedItem.name}
          </DialogTitle>
          <DialogDescription className="text-lg font-semibold text-muted-foreground">
            ฿{selectedItem.price}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] custom-scrollbar">
          <div className="space-y-4 px-1">
            {/* รูปภาพ */}
            <div className="relative h-48 w-full rounded-xl overflow-hidden">
              <Image
                src={selectedItem.imageUrl || "/placeholder.svg"}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
            </div>

            {/* คำอธิบายรูปภาพ */}
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {selectedItem.description}
            </p>

            {/* จำนวน */}
            <div className="space-y-3">
              <Label className="text-foreground font-medium">จำนวน</Label>
              <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  disabled={itemQuantity <= 1}
                  className="h-8 w-8 rounded-full p-0 border-input hover:bg-primary hover:text-primary-foreground"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center">
                  <span className="text-xl font-semibold text-foreground">
                    {itemQuantity}
                  </span>
                  <span className="text-xs text-muted-foreground">จำนวน</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItemQuantity(itemQuantity + 1)}
                  className="h-8 w-8 rounded-full p-0 border-input hover:bg-primary hover:text-primary-foreground"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              {/* ราคารวม */}
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ราคารวม</span>
                  <span className="text-lg font-semibold text-foreground">
                    ฿{selectedItem.price * itemQuantity}
                  </span>
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="space-y-2 my-2">
              <Label htmlFor="note" className="text-foreground font-medium">
                หมายเหตุ
              </Label>
              <Textarea
                id="note"
                placeholder="เช่น ไม่ใส่น้ำแข็ง, หวานน้อย, เผ็ดน้อย"
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="border-input focus:border-ring rounded-lg resize-none"
                rows={2}
                autoFocus={false} // ป้องกันการ focus อัตโนมัติ
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setItemDialogOpen(false)}
            className="flex-1 border-input hover:bg-accent hover:text-accent-foreground rounded-lg"
          >
            <X className="mr-2 h-4 w-4" />
            ยกเลิก
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-lg"
            onClick={handleAddItemToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            เพิ่มลงตะกร้า
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
