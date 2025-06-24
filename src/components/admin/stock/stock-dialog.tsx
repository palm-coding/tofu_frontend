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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Package,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import type { Stock } from "@/interfaces/stock.interface";
import type { UpdateIngredientDto } from "@/interfaces/ingredient.interface";

interface StockAdjustmentDialogProps {
  stock: Stock;
  onAdjustStock?: (
    stockId: string,
    newQuantity: number,
    adjustmentType: "add" | "subtract" | "set"
  ) => Promise<void>;
  onUpdateIngredient?: (
    ingredientId: string,
    updateData: UpdateIngredientDto
  ) => Promise<void>;
  onDeleteIngredient?: (
    stockId: string,
    ingredientId: string,
    ingredientName: string
  ) => Promise<void>;
}

export function StockAdjustmentDialog({
  stock,
  onAdjustStock,
  onUpdateIngredient,
  onDeleteIngredient,
}: StockAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "subtract" | "set"
  >("add");
  const [adjustmentValue, setAdjustmentValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit ingredient states
  const [editName, setEditName] = useState("");
  const [nameError, setNameError] = useState("");

  const ingredient =
    typeof stock.ingredientId === "object"
      ? stock.ingredientId
      : {
          name: `Ingredient ${stock.ingredientId}`,
          unit: "units",
          _id: stock.ingredientId,
        };

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

  const handleEditIngredient = async () => {
    if (!editName.trim()) {
      setNameError("กรุณากรอกชื่อวัตถุดิบ");
      return;
    }

    if (editName.trim().length < 2) {
      setNameError("ชื่อวัตถุดิบต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }

    setEditLoading(true);
    try {
      const updateData: UpdateIngredientDto = {
        name: editName.trim(),
      };

      if (onUpdateIngredient) {
        await onUpdateIngredient(ingredient._id, updateData);
      }

      setEditOpen(false);
      setEditName("");
      setNameError("");
    } catch (error) {
      console.error("Error updating ingredient:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteIngredient = async () => {
    setDeleteLoading(true);
    try {
      if (onDeleteIngredient) {
        await onDeleteIngredient(
          stock._id,
          ingredient._id,
          ingredient.name || ""
        );
      }

      setDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setAdjustmentValue("");
    setAdjustmentType("add");
  };

  const openEditDialog = () => {
    setEditName(ingredient.name || "");
    setNameError("");
    setEditOpen(true);
  };

  return (
    <>
      {/* Main Stock Adjustment Dialog */}
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DialogTrigger asChild>
              <DropdownMenuItem className="cursor-pointer">
                <Package className="h-4 w-4 mr-2" />
                ปรับปริมาณสต็อก
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={openEditDialog}
            >
              <Edit className="h-4 w-4 mr-2" />
              แก้ไขวัตถุดิบ
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ลบสต็อก
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

      {/* Edit Ingredient Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              แก้ไขวัตถุดิบ
            </DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของ {ingredient?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อวัตถุดิบ</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="ชื่อวัตถุดิบ"
                disabled={editLoading}
                className={nameError ? "border-destructive" : ""}
              />
              {nameError && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {nameError}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unit">หน่วยนับ</Label>
              <Input
                id="edit-unit"
                value={ingredient?.unit || ""}
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                หน่วยนับไม่สามารถแก้ไขได้เพื่อความถูกต้องของข้อมูล
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={editLoading}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleEditIngredient}
              disabled={!editName.trim() || editLoading}
              className="min-w-20"
            >
              {editLoading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              ยืนยันการลบสต็อก
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  คุณต้องการลบสต็อกของ{" "}
                  <strong>&quot;{ingredient?.name}&quot;</strong>{" "}
                  ออกจากสาขานี้ใช่หรือไม่?
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </p>
                  <ul className="text-sm text-destructive mt-2 space-y-1">
                    <li>• ข้อมูลสต็อกในสาขานี้จะถูกลบ</li>
                    <li>• วัตถุดิบยังคงอยู่ในระบบ</li>
                    <li>• สามารถเพิ่มสต็อกใหม่ได้ในภายหลัง</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIngredient}
              disabled={deleteLoading}
              className="bg-destructive hover:bg-destructive/90 min-w-20"
            >
              {deleteLoading ? "กำลังลบ..." : "ลบสต็อก"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
