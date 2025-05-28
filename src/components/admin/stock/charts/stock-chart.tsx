import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Stock, Ingredient } from "@/interfaces/stock.interface";

interface StockChartProps {
  stocks: Stock[];
  getIngredient: (id: string) => Ingredient | undefined;
}

export function StockChart({ stocks, getIngredient }: StockChartProps) {
  // Calculate max value for chart scaling
  const maxQuantity = Math.max(...stocks.map((stock) => stock.quantity), 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          กราฟแสดงปริมาณสต็อก
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stocks.map((stock) => {
            const ingredient = getIngredient(stock.ingredientId);
            if (!ingredient) return null;

            const percentage = (stock.quantity / maxQuantity) * 100;
            const isLowStock = stock.quantity <= stock.lowThreshold;

            return (
              <div key={stock.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {ingredient.name}
                    </span>
                    {isLowStock && (
                      <Badge variant="destructive" className="text-xs">
                        ใกล้หมด
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {stock.quantity} {ingredient.unit}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isLowStock
                        ? "bg-red-500"
                        : stock.quantity <= stock.lowThreshold * 1.5
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    เกณฑ์ต่ำสุด: {stock.lowThreshold} {ingredient.unit}
                  </span>
                  <span>{percentage.toFixed(1)}% ของค่าสูงสุด</span>
                </div>
              </div>
            );
          })}

          {stocks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>ยังไม่มีข้อมูลสต็อก</p>
              <p className="text-sm">
                เพิ่มวัตถุดิบเพื่อเริ่มต้นการจัดการสต็อก
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
