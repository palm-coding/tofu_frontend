"use client";

import { useEffect, useState } from "react";
import { stockService } from "@/services/stock.service";
import { ingredientService } from "@/services/ingredient.service";
import type { Stock } from "@/interfaces/stock.interface";
import type { UpdateIngredientDto } from "@/interfaces/ingredient.interface";
import { Badge } from "@/components/ui/badge";
import { Package, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockTable } from "./stock-table";
import { StockCharts } from "./stock-chart";
import { StockCreateDialog } from "./stock-create-dialog";
import { toast } from "sonner";
import { Branch } from "@/interfaces/branch.interface";

interface StockDisplayProps {
  branchCode: string;
  branchId: string;
  branch: Branch | null;
}

export function StockDisplay({ branchId }: StockDisplayProps) {
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
      // หาปริมาณที่ต้องปรับ
      const currentStock = stocks.find((stock) => stock._id === stockId);
      if (!currentStock) throw new Error("Stock not found");

      let adjustmentQuantity: number;
      let apiType: "add" | "remove"; // เปลี่ยนจาก "subtract" เป็น "remove"

      switch (adjustmentType) {
        case "add":
          adjustmentQuantity = newQuantity - currentStock.quantity;
          apiType = "add";
          break;
        case "subtract":
          adjustmentQuantity = currentStock.quantity - newQuantity;
          apiType = "remove"; // ส่ง "remove" แทน "subtract"
          break;
        case "set":
          // สำหรับ "set" ต้องคำนวณว่าควรเป็น add หรือ remove
          if (newQuantity > currentStock.quantity) {
            adjustmentQuantity = newQuantity - currentStock.quantity;
            apiType = "add";
          } else if (newQuantity < currentStock.quantity) {
            adjustmentQuantity = currentStock.quantity - newQuantity;
            apiType = "remove";
          } else {
            // ถ้าค่าเท่ากันไม่ต้องทำอะไร
            toast.success("ปริมาณเท่าเดิม ไม่ต้องปรับ");
            return;
          }
          break;
        default:
          throw new Error("Invalid adjustment type");
      }

      // ตรวจสอบค่าที่จะส่ง
      console.log("Current quantity:", currentStock.quantity);
      console.log("New quantity:", newQuantity);
      console.log("Adjustment type:", adjustmentType);
      console.log("API type:", apiType);
      console.log("Adjustment quantity:", adjustmentQuantity);

      // ป้องกันการส่งค่าติดลบ
      if (adjustmentQuantity <= 0) {
        toast.warning("ไม่ต้องปรับปริมาณ เนื่องจากค่าไม่เปลี่ยนแปลง");
        return;
      }

      // ใช้ adjustStock endpoint
      const adjustmentData = {
        type: apiType, // ใช้ "add" หรือ "remove"
        quantity: adjustmentQuantity,
        reason: "Manual adjustment from stock management",
      };

      console.log("Sending adjustment data:", adjustmentData);

      await stockService.adjustStock(stockId, adjustmentData);

      // อัปเดต state
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock._id === stockId ? { ...stock, quantity: newQuantity } : stock
        )
      );

      const actionText =
        adjustmentType === "add"
          ? "เพิ่ม"
          : adjustmentType === "subtract"
          ? "ลด"
          : "กำหนด";

      toast.success(
        `ปรับปริมาณสต็อกสำเร็จ\n${actionText}ปริมาณสต็อกเรียบร้อยแล้ว`
      );
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error(
        "เกิดข้อผิดพลาด: ไม่สามารถปรับปริมาณสต็อกได้ กรุณาลองอีกครั้ง"
      );
      throw error;
    }
  };

  const handleIngredientAdded = (newStocks: Stock[]) => {
    setStocks(newStocks);
  };

  // ฟังก์ชันแก้ไขวัตถุดิบ
  const handleUpdateIngredient = async (
    ingredientId: string,
    updateData: UpdateIngredientDto
  ) => {
    try {
      await ingredientService.update(ingredientId, updateData);

      // รีโหลดข้อมูล stock เพื่อให้ได้ข้อมูลวัตถุดิบที่อัปเดตแล้ว
      const stocksResponse = await stockService.getStocks(branchId);
      if (Array.isArray(stocksResponse?.data)) {
        setStocks(stocksResponse.data);
      }

      toast.success("แก้ไขวัตถุดิบสำเร็จ", {
        description: `เปลี่ยนชื่อเป็น "${updateData.name}" แล้ว`,
      });
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast.error("ไม่สามารถแก้ไขวัตถุดิบได้", {
        description: "กรุณาลองอีกครั้ง",
      });
      throw error;
    }
  };

  // ฟังก์ชันลบวัตถุดิบ
  const handleDeleteIngredient = async (
    stockId: string,
    ingredientId: string,
    ingredientName: string
  ) => {
    try {
      // ลบ stock entry ก่อน
      await stockService.deleteStock(branchId, stockId);

      // อัปเดต state โดยลบ stock ที่ถูกลบออก
      setStocks((prevStocks) =>
        prevStocks.filter((stock) => stock._id !== stockId)
      );

      toast.success("ลบวัตถุดิบสำเร็จ", {
        description: `ลบ "${ingredientName}" ออกจากระบบแล้ว`,
      });
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast.error("ไม่สามารถลบวัตถุดิบได้", {
        description: "กรุณาลองอีกครั้ง",
      });
      throw error;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              รายละเอียดสต็อก
            </h1>
            <p className="text-muted-foreground">
              ภาพรวมและรายงานของรายละเอียดสต็อก
            </p>
          </div>

          {/* ปุ่มเพิ่มวัตถุดิบใหม่ */}
          <StockCreateDialog
            branchId={branchId}
            onIngredientAdded={handleIngredientAdded}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-muted rounded-full border-t-primary"></div>
            <span className="ml-2">กำลังโหลดข้อมูล...</span>
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-destructive">
                <Package className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : stocks.length === 0 ? (
          <Card className="w-full">
            <CardContent className="p-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <Package className="h-16 w-16 text-muted-foreground opacity-50" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">ยังไม่มีข้อมูลสต็อก</h3>
                  <p className="text-muted-foreground max-w-md">
                    เริ่มต้นด้วยการเพิ่มวัตถุดิบแรกของคุณ
                    เพื่อเริ่มจัดการสต็อกอย่างมีประสิทธิภาพ
                  </p>
                </div>
                <StockCreateDialog
                  branchId={branchId}
                  onIngredientAdded={handleIngredientAdded}
                  trigger={
                    <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
                      <Plus className="h-4 w-4" />
                      เพิ่มวัตถุดิบแรก
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>
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
            <CardContent className="space-y-6">
              {/* Charts Section */}
              <div className="w-full">
                <StockCharts stocks={stocks} />
              </div>

              {/* Table Section */}
              <div className="w-full">
                <StockTable
                  stocks={stocks}
                  onAdjustStock={handleAdjustStock}
                  onUpdateIngredient={handleUpdateIngredient}
                  onDeleteIngredient={handleDeleteIngredient}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
