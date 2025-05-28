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
        // ใช้ "branch1" สำหรับการพัฒนาแทน branchId จริงที่ถูกส่งมา
        const mockBranchId = "branch1";

        const [ingredientsRes, stocksRes] = await Promise.all([
          stockService.getIngredients(),
          stockService.getStocks(mockBranchId), // ใช้ mockBranchId แทน
        ]);
        setIngredients(ingredientsRes.ingredients);
        setStocks(stocksRes.stocks);
        console.log("Fetched ingredients:", ingredientsRes.ingredients);
        console.log("Fetched stocks:", stocksRes.stocks);
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

        {stocks.length === 0 ? (
          <div className="bg-muted p-8 rounded-lg text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">ยังไม่มีข้อมูลสต็อก</h3>
            <p className="text-muted-foreground mb-4">
              เพิ่มวัตถุดิบเพื่อเริ่มต้นการจัดการสต็อกสำหรับสาขานี้
            </p>
            <button
              onClick={() => {
                // สร้าง stock สำหรับวัตถุดิบที่มีอยู่แล้วทั้งหมด
                ingredients.forEach(async (ingredient) => {
                  try {
                    const response = await stockService.createStock(
                      branchId,
                      ingredient.id
                    );
                    setStocks((prevStocks) => [...prevStocks, response.stock]);
                  } catch (err) {
                    console.error("Error creating stock:", err);
                  }
                });
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              สร้าง Stock ทั้งหมด
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
