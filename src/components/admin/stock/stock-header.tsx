"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AddIngredientDialog } from "./components/add-ingredient-dialog";
import type { Ingredient, Stock } from "@/interfaces/stock.interface";

interface StockHeaderProps {
  ingredients: Ingredient[];
  setIngredients: (value: Ingredient[]) => void;
  stocks: Stock[];
  setStocks: (value: Stock[]) => void;
  branchId?: string;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
}

export function StockHeader({
  ingredients,
  setIngredients,
  stocks,
  setStocks,
  branchId,
  onRefresh,
  refreshing = false,
}: StockHeaderProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              จัดการสต็อกวัตถุดิบ
            </h1>
            <p className="text-muted-foreground">
              ข้อมูลปริมาณวัตถุดิบและสถานะคลัง
            </p>
          </div>
          {onRefresh && (
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "กำลังรีเฟรช..." : "รีเฟรชทั้งหมด"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">รายการวัตถุดิบทั้งหมด</h2>
        <AddIngredientDialog
          stocks={stocks}
          setStocks={setStocks}
          branchId={branchId ?? ""}
        />
      </div>
    </div>
  );
}
