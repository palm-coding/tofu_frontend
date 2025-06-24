import type { Stock } from "@/interfaces/stock.interface";
import type { UpdateIngredientDto } from "@/interfaces/ingredient.interface";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { StockAdjustmentDialog } from "./stock-dialog";

interface StockTableProps {
  stocks: Stock[];
  onAdjustStock?: (
    stockId: string,
    newQuantity: number,
    adjustmentType: "add" | "subtract" | "set"
  ) => Promise<void>;
  onUpdateIngredient?: (
    ingredientId: string,
    updateData: UpdateIngredientDto
  ) => Promise<void>;
  onDeleteIngredient?: (
    stockId: string,
    ingredientId: string,
    ingredientName: string
  ) => Promise<void>;
}

export function StockTable({
  stocks,
  onAdjustStock,
  onUpdateIngredient,
  onDeleteIngredient,
}: StockTableProps) {
  const getStockStatus = (quantity: number, lowThreshold: number) => {
    if (quantity <= lowThreshold) {
      return {
        label: "ใกล้หมด",
        variant: "destructive" as const,
        icon: AlertTriangle,
        className: "text-destructive",
      };
    } else if (quantity <= lowThreshold * 1.5) {
      return {
        label: "ต่ำ",
        variant: "secondary" as const,
        icon: AlertTriangle,
        className: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    }
    return {
      label: "ปกติ",
      variant: "secondary" as const,
      icon: CheckCircle,
      className: "text-green-600 bg-green-50 border-green-200",
    };
  };

  return (
    <Table className="border rounded-lg overflow-hidden">
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="font-semibold text-foreground">
            ชื่อวัตถุดิบ
          </TableHead>
          <TableHead className="text-right font-semibold text-foreground">
            คงเหลือ
          </TableHead>
          <TableHead className="text-right font-semibold text-foreground">
            เกณฑ์ต่ำสุด
          </TableHead>
          <TableHead className="text-center font-semibold text-foreground">
            สถานะ
          </TableHead>
          <TableHead className="text-center font-semibold text-foreground">
            จัดการ
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {stocks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-12">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Package className="h-12 w-12 opacity-50" />
                <div className="space-y-1">
                  <p className="font-medium">ยังไม่มีข้อมูลสต็อก</p>
                  <p className="text-sm">กรุณาเพิ่มวัตถุดิบเพื่อเริ่มต้น</p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          stocks.map((stock, index) => {
            // Handle different possible structures for ingredient data
            const ingredient =
              typeof stock.ingredientId === "object"
                ? stock.ingredientId
                : {
                    name: `Ingredient ${stock.ingredientId}`,
                    unit: "units",
                    _id: stock.ingredientId,
                  };

            const stockStatus = getStockStatus(
              stock.quantity,
              stock.lowThreshold
            );
            const StatusIcon = stockStatus.icon;

            return (
              <TableRow
                key={stock._id || `stock-${index}`}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                    {ingredient?.name || "Unknown Ingredient"}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className={`font-mono text-sm ${
                        stock.quantity <= stock.lowThreshold
                          ? "text-destructive font-semibold"
                          : "text-foreground"
                      }`}
                    >
                      {stock.quantity.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ingredient?.unit || "units"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-sm text-muted-foreground">
                      {stock.lowThreshold.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ingredient?.unit || "units"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <Badge
                    variant={stockStatus.variant}
                    className={`text-xs inline-flex items-center gap-1 ${
                      stockStatus.variant === "secondary"
                        ? stockStatus.className
                        : ""
                    }`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {stockStatus.label}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  <StockAdjustmentDialog
                    stock={stock}
                    onAdjustStock={onAdjustStock}
                    onUpdateIngredient={onUpdateIngredient}
                    onDeleteIngredient={onDeleteIngredient}
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
