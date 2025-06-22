"use client";

import { useEffect, useState } from "react";
import { stockService } from "@/services/stock.service";
import type { Stock } from "@/interfaces/stock.interface";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockTable } from "./stock-table";
import { StockCharts } from "./stock-chart";
import { toast } from "sonner";
import { Branch } from "@/interfaces/branch.interface";

interface StockDisplayProps {
  branchCode: string;
  branchId: string;
  branch: Branch | null;
}

export function StockDisplay({
  branchId,
}: StockDisplayProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lowStockCount = stocks.filter(
    (stock) => stock.quantity <= stock.lowThreshold
  ).length;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (!branchId) {
          setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
          return;
        }

        const stocksResponse = await stockService.getStocks(branchId);
        console.log("Stocks response:", stocksResponse);

        if (Array.isArray(stocksResponse?.data)) {
          setStocks(stocksResponse.data);
        } else {
          setStocks([]);
        }
      } catch (err) {
        console.error("Error loading stock data:", err);
        setError("ไม่สามารถโหลดข้อมูลสต็อกได้ กรุณาลองอีกครั้ง");
        setStocks([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  const handleAdjustStock = async (
    stockId: string,
    newQuantity: number,
    adjustmentType: "add" | "subtract" | "set"
  ) => {
    try {
      // Update the stock via your API service
      // You'll need to implement this method in your stockService
      await stockService.updateStock(stockId, { quantity: newQuantity });

      // Update local state
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock._id === stockId ? { ...stock, quantity: newQuantity } : stock
        )
      );

      // Show success message
      const actionText =
        adjustmentType === "add"
          ? "เพิ่ม"
          : adjustmentType === "subtract"
          ? "ลด"
          : "กำหนด";

      try {
        toast.success(
          `ปรับปริมาณสต็อกสำเร็จ\n${actionText}ปริมาณสต็อกเรียบร้อยแล้ว`
        );
      } catch (err) {
        console.error(err);
        toast.error(
          "เกิดข้อผิดพลาด: ไม่สามารถปรับปริมาณสต็อกได้ กรุณาลองอีกครั้ง"
        );
      }
    } catch (error) {
      throw error; // Re-throw to handle in dialog
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">รายละเอียดสต็อก</h1>
        <p className="text-muted-foreground">
          ภาพรวมและรายงานของรายละเอียดสต็อก
        </p>
      </div>
      <div className="mt-6 flex flex-col space-y-4">
        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Package className="h-5 w-5" />
                  ตารางรายละเอียดสต็อก
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>รวม {stocks.length} รายการ</span>
                  {lowStockCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      ใกล้หมด {lowStockCount} รายการ
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <StockCharts stocks={stocks} />
              <StockTable stocks={stocks} onAdjustStock={handleAdjustStock} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
