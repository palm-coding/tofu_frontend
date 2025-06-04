"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Minus } from "lucide-react";
import { stockService } from "@/services/stock.service";
import type { Stock, AdjustStockDto } from "@/interfaces/stock.interface";

interface StockAdjustmentButtonsProps {
  stock: Stock;
  ingredient: any;
  branchId: string;
  onStockUpdate: (updatedStock: Stock) => void;
  onRefresh?: () => Promise<void>;
}

export function StockAdjustmentButtons({
  stock,
  ingredient,
  branchId,
  onStockUpdate,
  onRefresh,
}: StockAdjustmentButtonsProps) {
  const [open, setOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuickAdjustment = async (
    type: "add" | "remove",
    amount: number
  ) => {
    try {
      setLoading(true);

      const adjustmentData: AdjustStockDto = {
        quantity: amount,
        type: type,
      };

      const response = await stockService.adjustStock(
        branchId,
        stock._id,
        adjustmentData
      );

      if (response && response.stock) {
        // Update local state first for immediate UI feedback
        onStockUpdate(response.stock);
      }

      // Always refresh to ensure data consistency
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error(`Failed to adjust stock ${stock._id}:`, error);

      // If there's an error, still try to refresh to get the current state
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAdjustment = async () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) return;

    try {
      setLoading(true);

      const adjustmentData: AdjustStockDto = {
        quantity: Number(quantity),
        type: adjustmentType,
      };

      const response = await stockService.adjustStock(
        branchId,
        stock._id,
        adjustmentData
      );

      if (response && response.stock) {
        // Update local state first for immediate UI feedback
        onStockUpdate(response.stock);
      }

      // Always refresh to ensure data consistency
      if (onRefresh) {
        await onRefresh();
      }

      // Close dialog and reset form
      setOpen(false);
      setQuantity("");
      setAdjustmentType("add");
    } catch (error) {
      console.error(`Failed to adjust stock ${stock._id}:`, error);

      // If there's an error, still try to refresh to get the current state
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => handleQuickAdjustment("remove", 1)}
        disabled={stock.quantity <= 0 || loading}
      >
        <Minus className="h-3 w-3" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => handleQuickAdjustment("add", 1)}
        disabled={loading}
      >
        <Plus className="h-3 w-3" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={loading}
          >
            ปรับ
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ปรับปริมาณสต็อก</DialogTitle>
            <DialogDescription>
              ปรับปริมาณสต็อกของ <strong>{ingredient.name}</strong>
              <br />
              ปริมาณปัจจุบัน: {stock.quantity} {ingredient.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={adjustmentType === "add" ? "default" : "outline"}
                className={
                  adjustmentType === "add"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
                onClick={() => setAdjustmentType("add")}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                เพิ่ม
              </Button>
              <Button
                variant={adjustmentType === "remove" ? "default" : "outline"}
                className={
                  adjustmentType === "remove"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
                onClick={() => setAdjustmentType("remove")}
                disabled={loading}
              >
                <Minus className="mr-2 h-4 w-4" />
                ลด
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">จำนวน ({ingredient.unit})</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="กรอกจำนวนที่ต้องการปรับ"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={loading}
              />
            </div>
            {adjustmentType === "remove" &&
              Number(quantity) > stock.quantity && (
                <p className="text-sm text-red-600">
                  ⚠️ จำนวนที่ต้องการลดมากกว่าปริมาณคงเหลือ
                </p>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setQuantity("");
                setAdjustmentType("add");
              }}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleCustomAdjustment}
              disabled={
                loading ||
                !quantity ||
                Number(quantity) <= 0 ||
                (adjustmentType === "remove" &&
                  Number(quantity) > stock.quantity)
              }
            >
              {loading
                ? "กำลังปรับ..."
                : `${adjustmentType === "add" ? "เพิ่ม" : "ลด"} ${
                    quantity || 0
                  } ${ingredient.unit}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
