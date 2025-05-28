import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ingredient, Stock } from "@/interfaces/stock.interface";

interface IngredientTableProps {
  stocks: Stock[];
  ingredients: Ingredient[];
  getIngredient: (id: string) => Ingredient | undefined;
  branchId: string;
  setIngredients: (value: Ingredient[]) => void;
  setStocks: (value: Stock[]) => void;
}

export function IngredientTable({
  stocks,
  ingredients,
  getIngredient,
  branchId,
  setIngredients,
  setStocks,
}: IngredientTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          ตารางรายละเอียดสต็อก
        </CardTitle>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stocks.map((stock) => {
                const ingredient = getIngredient(stock.ingredientId);
                const isLowStock = stock.quantity <= stock.lowThreshold;

                return (
                  <tr key={stock.ingredientId} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">
                      {ingredient?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          isLowStock ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {stock.quantity} {ingredient?.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {stock.lowThreshold} {ingredient?.unit}
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
                  </tr>
                );
              })}

              {stocks.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
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
