"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Package, AlertTriangle } from "lucide-react";
import type { Stock } from "@/interfaces/stock.interface";

interface StockAdjustmentDialogProps {
  stock: Stock;
  onAdjustStock?: (
    stockId: string,
    newQuantity: number,
    adjustmentType: "add" | "subtract" | "set"
  ) => Promise<void>;
}

export function StockAdjustmentDialog({
  stock,
  onAdjustStock,
}: StockAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "subtract" | "set"
  >("add");
  const [adjustmentValue, setAdjustmentValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const ingredient =
    typeof stock.ingredientId === "object"
      ? stock.ingredientId
      : { name: `Ingredient ${stock.ingredientId}`, unit: "units" };

  const currentQuantity = stock.quantity;
  const threshold = stock.lowThreshold;
  const isLowStock = currentQuantity <= threshold;

  const calculateNewQuantity = () => {
    const value = parseFloat(adjustmentValue) || 0;
    switch (adjustmentType) {
      case "add":
        return currentQuantity + value;
      case "subtract":
        return Math.max(0, currentQuantity - value);
      case "set":
        return Math.max(0, value);
      default:
        return currentQuantity;
    }
  };

  const newQuantity = calculateNewQuantity();
  const willBeLowStock = newQuantity <= threshold;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentValue || parseFloat(adjustmentValue) <= 0) return;

    setLoading(true);
    try {
      if (onAdjustStock) {
        await onAdjustStock(stock._id, newQuantity, adjustmentType);
      }
      setOpen(false);
      setAdjustmentValue("");
    } catch (error) {
      console.error("Error adjusting stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAdjustmentValue("");
    setAdjustmentType("add");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2">
          <Package className="h-3 w-3 mr-1" />
          ปรับ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            ปรับปริมาณสต็อก
          </DialogTitle>
          <DialogDescription>
            ปรับปริมาณสต็อกสำหรับ {ingredient?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Stock Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ปริมาณปัจจุบัน:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-lg ${
                    isLowStock ? "text-destructive font-bold" : ""
                  }`}
                >
                  {currentQuantity.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {ingredient?.unit}
                </span>
                {isLowStock && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    ใกล้หมด
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                เกณฑ์ต่ำสุด:
              </span>
              <span className="font-mono text-sm">
                {threshold.toLocaleString()} {ingredient?.unit}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adjustment Type Selection */}
            <div className="space-y-2">
              <Label>ประเภทการปรับ</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdjustmentType("add")}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  เพิ่ม
                </Button>
                <Button
                  type="button"
                  variant={
                    adjustmentType === "subtract" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setAdjustmentType("subtract")}
                  className="flex items-center gap-1"
                >
                  <Minus className="h-3 w-3" />
                  ลด
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === "set" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdjustmentType("set")}
                >
                  กำหนด
                </Button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="adjustment-value">
                {adjustmentType === "add" && "จำนวนที่ต้องการเพิ่ม"}
                {adjustmentType === "subtract" && "จำนวนที่ต้องการลด"}
                {adjustmentType === "set" && "จำนวนที่ต้องการกำหนด"}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="adjustment-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  placeholder="0"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground min-w-fit">
                  {ingredient?.unit}
                </span>
              </div>
            </div>

            {/* Preview */}
            {adjustmentValue && parseFloat(adjustmentValue) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    ปริมาณหลังปรับ:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-lg font-bold ${
                        willBeLowStock ? "text-destructive" : "text-blue-900"
                      }`}
                    >
                      {newQuantity.toLocaleString()}
                    </span>
                    <span className="text-sm text-blue-700">
                      {ingredient?.unit}
                    </span>
                    {willBeLowStock && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        ใกล้หมด
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-xs text-blue-700">
                  {adjustmentType === "add" &&
                    `เพิ่ม ${adjustmentValue} ${ingredient?.unit}`}
                  {adjustmentType === "subtract" &&
                    `ลด ${adjustmentValue} ${ingredient?.unit}`}
                  {adjustmentType === "set" &&
                    `กำหนดเป็น ${adjustmentValue} ${ingredient?.unit}`}
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !adjustmentValue || parseFloat(adjustmentValue) <= 0 || loading
            }
            className="min-w-20"
          >
            {loading ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
