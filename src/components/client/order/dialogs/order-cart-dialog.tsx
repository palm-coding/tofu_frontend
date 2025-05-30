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
import { Input } from "@/components/ui/input";
import { Check, MinusCircle, PlusCircle, ShoppingCart, X } from "lucide-react";
import { CartItem } from "@/interfaces/cart.interface";

interface OrderCartDialogProps {
  cart: CartItem[];
  cartDialogOpen: boolean;
  setCartDialogOpen: (open: boolean) => void;
  removeFromCart: (itemId: string) => void;
  addToCart: (item: CartItem) => void;
  updateCartItemNote: (itemId: string, note: string) => void;
  calculateTotal: () => number;
  submitOrder: () => void;
}

export function OrderCartDialog({
  cart,
  cartDialogOpen,
  setCartDialogOpen,
  removeFromCart,
  addToCart,
  updateCartItemNote,
  calculateTotal,
  submitOrder,
}: OrderCartDialogProps) {
  return (
    <Dialog open={cartDialogOpen} onOpenChange={setCartDialogOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] bg-background border-0 shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-light text-foreground">
            รายการสั่งซื้อ
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            รายการอาหารที่คุณเลือก ({Array.isArray(cart) ? cart.length : 0}{" "}
            รายการ)
          </DialogDescription>
        </DialogHeader>

        {Array.isArray(cart) && cart.length > 0 ? (
          <>
            <ScrollArea className="max-h-[50vh] custom-scrollbar">
              <div className="space-y-4 pr-2">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="py-4 border-b border-border last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground text-lg">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ฿{item.price} × {item.quantity} = ฿
                          {item.price * item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls in Cart */}
                    <div className="flex items-center justify-center space-x-4 bg-muted rounded-xl p-3 mb-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-input hover:bg-primary hover:text-primary-foreground"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium text-lg">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-input hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addToCart(item)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    <Input
                      placeholder="หมายเหตุ เช่น ไม่ใส่น้ำแข็ง, หวานน้อย"
                      value={item.note}
                      onChange={(e) =>
                        updateCartItemNote(item._id, e.target.value)
                      }
                      className="text-sm border-2 border-input focus:border-ring rounded-xl"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="bg-muted rounded-xl p-4 border-t border-border">
              <div className="flex justify-between items-center font-semibold text-xl">
                <span className="text-foreground">รวมทั้งสิ้น</span>
                <span className="text-2xl text-foreground">
                  ฿{calculateTotal()}
                </span>
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCartDialogOpen(false)}
                className="flex-1 border-2 border-input hover:bg-accent hover:text-accent-foreground rounded-xl py-3"
              >
                <X className="mr-2 h-4 w-4" />
                ยกเลิก
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-xl py-3"
                onClick={submitOrder}
              >
                <Check className="mr-2 h-4 w-4" />
                ยืนยันการสั่ง
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-16 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-6">
              ไม่มีรายการในตะกร้า
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-xl px-8 py-3"
              onClick={() => setCartDialogOpen(false)}
            >
              เลือกเมนู
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
