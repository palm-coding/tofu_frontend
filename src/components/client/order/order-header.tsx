import { Store } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionData, CartItem } from "@/interfaces/order.interface";

interface OrderHeaderProps {
  session: SessionData | null;
  userName: string;
  cart: CartItem[]; // แก้ไขจาก any[] เป็น CartItem[]
  setCartDialogOpen: (open: boolean) => void;
}

export function OrderHeader({
  session,
  userName,
  cart,
  setCartDialogOpen,
}: OrderHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Store className="h-6 w-6 text-foreground mr-3" />
            <div>
              <h1 className="text-lg font-light text-foreground">
                น้ำเต้าหู้พัทลุง
              </h1>
              <p className="text-sm text-muted-foreground">
                {session?.branchName} - {session?.tableName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="bg-muted text-foreground border-border"
            >
              {userName}
            </Badge>
            {cart.length > 0 && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
                onClick={() => setCartDialogOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                {cart.length}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
