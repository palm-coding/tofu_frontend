"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { stockService } from "@/services/stock.service";
import type { Ingredient, Stock } from "@/interfaces/stock.interface";

import { StockHeader } from "./stock-header";
import { LowStockAlert } from "./low-stock-alert";
import { IngredientTable } from "./ingredient-table";
import { StockChart } from "./charts/stock-chart";

interface StockDisplayProps {
  branchId: string;
}

export function StockDisplay({ branchId }: StockDisplayProps) {
  console.log("branchId", branchId);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        setLoading(true);
        setError(null);
        const [ingredientsRes, stocksRes] = await Promise.all([
          stockService.getIngredients(),
          stockService.getStocks(branchId),
        ]);
        setIngredients(ingredientsRes.ingredients);
        setStocks(stocksRes.stocks);
      } catch (err) {
        console.error("Error loading stock data:", err);
        setError("ไม่สามารถโหลดข้อมูลสต็อกได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
  }, [branchId]);

  const getIngredient = (ingredientId: string) =>
    ingredients.find((ing) => ing.id === ingredientId);

  const lowStockItems = stocks.filter(
    (stock) => stock.quantity <= stock.lowThreshold
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>กำลังโหลดข้อมูลสต็อก...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <button
            className="mt-2 bg-destructive text-white py-1 px-3 rounded"
            onClick={() => window.location.reload()}
          >
            ลองใหม่อีกครั้ง
          </button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <StockHeader
          ingredients={ingredients}
          setIngredients={setIngredients}
          stocks={stocks}
          setStocks={setStocks}
          branchId={branchId}
        />

        {lowStockItems.length > 0 && (
          <LowStockAlert count={lowStockItems.length} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockChart stocks={stocks} getIngredient={getIngredient} />

          <IngredientTable
            stocks={stocks}
            ingredients={ingredients}
            getIngredient={getIngredient}
            branchId={branchId}
            setIngredients={setIngredients}
            setStocks={setStocks}
          />
        </div>
      </div>
    </div>
  );
}
