"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { stockService } from "@/services/stock.service";
import { ingredientService } from "@/services/ingredient.service";
import type { Ingredient, Stock } from "@/interfaces/stock.interface";

import { StockHeader } from "./stock-header";
import { LowStockAlert } from "./low-stock-alert";
import { IngredientTable } from "./ingredient-table";
import { StockChart } from "./components/stock-chart";
import type { Branch } from "@/interfaces/branch.interface";

interface StockDisplayProps {
  branchCode: string;
  branchId?: string;
  branch?: Branch | null;
}

export function StockDisplay({ branchId }: StockDisplayProps) {
  console.log("branchId", branchId);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingStocks, setCreatingStocks] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Main function to fetch all stock data
  const fetchStockData = async () => {
    if (!branchId) {
      setError("ไม่พบรหัสสาขา กรุณาตรวจสอบอีกครั้ง");
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const [ingredientsRes, stocksRes] = await Promise.all([
        ingredientService.getIngredients(),
        stockService.getStocks(branchId),
      ]);

      // Handle different possible response structures
      const ingredientsData =
        ingredientsRes?.data ||
        ingredientsRes?.ingredients ||
        ingredientsRes ||
        [];
      const stocksData =
        stocksRes?.data || stocksRes?.stocks || stocksRes || [];

      setIngredients(ingredientsData);
      setStocks(stocksData);

      console.log("Fetched ingredients:", ingredientsData);
      console.log("Fetched stocks:", stocksData);
    } catch (err) {
      console.error("Error loading stock data:", err);
      setError("ไม่สามารถโหลดข้อมูลสต็อกได้ กรุณาลองอีกครั้ง");
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchStockData();
      setLoading(false);
    };

    loadInitialData();
  }, [branchId]);

  const lowStockItems = stocks.filter(
    (stock) => stock.quantity <= (stock.lowThreshold || stock.threshold || 0)
  );

  const handleCreateAllStocks = async () => {
    if (!branchId) {
      console.error("Branch ID is required to create stock");
      return;
    }

    setCreatingStocks(true);
    const newStocks: Stock[] = [];

    try {
      // Create stocks for ingredients that don't already have stock entries
      const existingStockIngredientIds = stocks.map(
        (stock) => stock.ingredientId
      );
      const ingredientsNeedingStock = ingredients.filter(
        (ingredient) => !existingStockIngredientIds.includes(ingredient.id)
      );

      for (const ingredient of ingredientsNeedingStock) {
        try {
          const response = await stockService.createStock(
            branchId,
            ingredient.id
          );
          const newStock = response?.stock || response;
          if (newStock) {
            newStocks.push(newStock);
          }
        } catch (err) {
          console.error(
            `Error creating stock for ingredient ${ingredient.name}:`,
            err
          );
        }
      }

      if (newStocks.length > 0) {
        setStocks((prevStocks) => [...prevStocks, ...newStocks]);
      }
    } catch (err) {
      console.error("Error creating stocks:", err);
      setError("ไม่สามารถสร้างสต็อกได้ กรุณาลองอีกครั้ง");
    } finally {
      setCreatingStocks(false);
    }
  };

  // Enhanced refresh function that properly updates state
  const refreshStockData = async () => {
    if (!branchId) return;

    try {
      setRefreshing(true);
      console.log("Refreshing stock data...");

      // Fetch fresh data from the server
      const [ingredientsRes, stocksRes] = await Promise.all([
        ingredientService.getIngredients(),
        stockService.getStocks(branchId),
      ]);

      // Handle different possible response structures
      const ingredientsData =
        ingredientsRes?.data ||
        ingredientsRes?.ingredients ||
        ingredientsRes ||
        [];
      const stocksData =
        stocksRes?.data || stocksRes?.stocks || stocksRes || [];

      console.log("Refreshed ingredients data:", ingredientsData);
      console.log("Refreshed stocks data:", stocksData);

      // Update the state with fresh data
      setIngredients(ingredientsData);
      setStocks(stocksData);
    } catch (err) {
      console.error("Error refreshing stock data:", err);
      setError("ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองอีกครั้ง");
    } finally {
      setRefreshing(false);
    }
  };

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
            className="mt-2 bg-destructive text-destructive-foreground py-1 px-3 rounded hover:bg-destructive/90 transition-colors"
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
          onRefresh={refreshStockData}
          refreshing={refreshing}
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
            {ingredients.length > 0 ? (
              <button
                onClick={handleCreateAllStocks}
                disabled={creatingStocks || !branchId}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {creatingStocks && <Loader2 className="h-4 w-4 animate-spin" />}
                {creatingStocks ? "กำลังสร้าง..." : "สร้าง Stock ทั้งหมด"}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                ยังไม่มีวัตถุดิบในระบบ กรุณาเพิ่มวัตถุดิบก่อน
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockChart stocks={stocks} />

            <IngredientTable
              stocks={stocks}
              branchId={branchId ?? ""}
              setStocks={setStocks}
              onRefresh={refreshStockData}
              refreshing={refreshing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
