import { AddIngredientDialog } from "./dialogs/add-ingredient-dialog";
import type { Ingredient, Stock } from "@/interfaces/stock.interface";

interface StockHeaderProps {
  ingredients: Ingredient[];
  setIngredients: (value: Ingredient[]) => void;
  stocks: Stock[];
  setStocks: (value: Stock[]) => void;
  branchId: string;
}

export function StockHeader({
  ingredients,
  setIngredients,
  stocks,
  setStocks,
  branchId,
}: StockHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          จัดการสต็อกวัตถุดิบ
        </h1>
        <p className="text-muted-foreground">
          ข้อมูลปริมาณวัตถุดิบและสถานะคลัง
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">รายการวัตถุดิบทั้งหมด</h2>
        <AddIngredientDialog
          ingredients={ingredients}
          setIngredients={setIngredients}
          stocks={stocks}
          setStocks={setStocks}
          branchId={branchId}
        />
      </div>
    </div>
  );
}
