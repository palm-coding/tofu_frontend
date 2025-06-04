import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { StockAdjustmentButtons } from "./components/stock-adjustment-buttons";
import type { Stock } from "@/interfaces/stock.interface";

interface IngredientTableProps {
  stocks: Stock[];
  branchId: string;
  setStocks: React.Dispatch<React.SetStateAction<Stock[]>>;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}

export function IngredientTable({
  stocks,
  branchId,
  setStocks,
  onRefresh,
  refreshing = false,
}: IngredientTableProps) {
  const handleStockUpdate = (updatedStock: Stock) => {
    setStocks(
      stocks.map((stock) =>
        stock._id === updatedStock._id ? updatedStock : stock
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          ตารางรายละเอียดสต็อก
        </CardTitle>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "กำลังรีเฟรช..." : "รีเฟรชข้อมูล"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  ชื่อวัตถุดิบ
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  คงเหลือ
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  เกณฑ์ต่ำสุด
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  สถานะ
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  ปรับปริมาณ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stocks.map((stock) => {
                const ingredient = stock.ingredientId as any;
                const isLowStock = stock.quantity <= stock.lowThreshold;

                return (
                  <tr key={stock._id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{ingredient.name}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          isLowStock ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {stock.quantity} {ingredient.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {stock.lowThreshold} {ingredient.unit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLowStock ? (
                        <Badge variant="destructive" className="text-xs">
                          ใกล้หมด
                        </Badge>
                      ) : stock.quantity <= stock.lowThreshold * 1.5 ? (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-100 text-yellow-800"
                        >
                          ต่ำ
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          ปกติ
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StockAdjustmentButtons
                        stock={stock}
                        ingredient={ingredient}
                        branchId={branchId}
                        onStockUpdate={handleStockUpdate}
                        onRefresh={onRefresh}
                      />
                    </td>
                  </tr>
                );
              })}

              {stocks.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    ยังไม่มีข้อมูลสต็อก กรุณาเพิ่มวัตถุดิบเพื่อเริ่มต้น
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
