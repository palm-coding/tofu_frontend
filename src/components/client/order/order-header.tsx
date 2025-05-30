import { Store } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// แก้ไขการนำเข้า interfaces
import { Session } from "@/interfaces/session.interface";
import { CartItem } from "@/interfaces/cart.interface"; // แก้ไขการ import

interface OrderHeaderProps {
  session: Session | null;
  userName: string;
  cart: CartItem[];
  setCartDialogOpen: (open: boolean) => void;
}

export function OrderHeader({
  session,
  userName,
  cart,
  setCartDialogOpen,
}: OrderHeaderProps) {
  // Helper เพื่อดึงชื่อจาก object หรือ string
  const getBranchName = () => {
    if (!session?.branchId) return "";
    if (
      typeof session.branchId === "object" &&
      session.branchId &&
      "name" in session.branchId
    ) {
      return session.branchId.name || "";
    }
    return "";
  };

  const getTableName = () => {
    if (!session?.tableId) return "";
    if (
      typeof session.tableId === "object" &&
      session.tableId &&
      "name" in session.tableId
    ) {
      return session.tableId.name || "";
    }
    return "";
  };

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
                {getBranchName()} - {getTableName()}
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
            {Array.isArray(cart) && cart.length > 0 && (
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
