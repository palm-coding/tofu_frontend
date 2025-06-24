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
import { Plus, Package2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ingredientService } from "@/services/ingredient.service";
import { stockService } from "@/services/stock.service";
import type { CreateIngredientDto } from "@/interfaces/ingredient.interface";
import type { Stock } from "@/interfaces/stock.interface";

interface StockCreateDialogProps {
  branchId: string;
  onIngredientAdded: (newStocks: Stock[]) => void;
  trigger?: React.ReactNode;
}

export function StockCreateDialog({
  branchId,
  onIngredientAdded,
  trigger,
}: StockCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIngredient, setNewIngredient] = useState<CreateIngredientDto>({
    name: "",
    unit: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    unit?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; unit?: string } = {};

    if (!newIngredient.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อวัตถุดิบ";
    } else if (newIngredient.name.trim().length < 2) {
      newErrors.name = "ชื่อวัตถุดิบต้องมีอย่างน้อย 2 ตัวอักษร";
    }

    if (!newIngredient.unit.trim()) {
      newErrors.unit = "กรุณากรอกหน่วยนับ";
    } else if (newIngredient.unit.trim().length < 1) {
      newErrors.unit = "หน่วยนับต้องมีอย่างน้อย 1 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // เพิ่ม ingredient ใหม่
      const ingredientResponse = await ingredientService.addIngredient(
        newIngredient
      );

      console.log("Ingredient added:", ingredientResponse);

      try {
        // สร้าง stock entry สำหรับ ingredient ใหม่
        await stockService.createStock(branchId, ingredientResponse._id, 0);
        console.log(
          "Stock created for new ingredient:",
          ingredientResponse._id
        );
      } catch (stockError) {
        console.warn(
          "Failed to create stock, but ingredient was created:",
          stockError
        );
        // แม้ว่าการสร้าง stock จะล้มเหลว แต่ ingredient ถูกสร้างแล้ว
        // ให้แสดงข้อความเตือนแต่ยังคงดำเนินการต่อ
        toast.warning("เพิ่มวัตถุดิบสำเร็จ แต่ไม่สามารถสร้างสต็อกได้", {
          description: "กรุณาติดต่อผู้ดูแลระบบหรือสร้างสต็อกแยกต่างหาก",
        });
      }

      // รีโหลดข้อมูล stock (แม้ว่าการสร้าง stock จะล้มเหลวก็ตาม)
      try {
        const stocksResponse = await stockService.getStocks(branchId);
        if (Array.isArray(stocksResponse?.data)) {
          onIngredientAdded(stocksResponse.data);
        }
      } catch (fetchError) {
        console.warn("Failed to reload stocks:", fetchError);
        // รีโหลดหน้าเว็บเพื่อให้ข้อมูลอัปเดต
        window.location.reload();
      }

      // รีเซ็ตฟอร์มและปิด dialog
      resetForm();
      setOpen(false);

      toast.success("เพิ่มวัตถุดิบใหม่สำเร็จ", {
        description: `วัตถุดิบ "${newIngredient.name}" ถูกเพิ่มเข้าสู่ระบบแล้ว`,
      });
    } catch (error) {
      console.error("Error adding ingredient:", error);
      toast.error("ไม่สามารถเพิ่มวัตถุดิบได้", {
        description: "กรุณาตรวจสอบข้อมูลและลองอีกครั้ง",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewIngredient({ name: "", unit: "" });
    setErrors({});
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleInputChange = (
    field: keyof CreateIngredientDto,
    value: string
  ) => {
    setNewIngredient((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      เพิ่มวัตถุดิบ
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5 text-primary" />
            เพิ่มวัตถุดิบใหม่
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลวัตถุดิบที่ต้องการเพิ่มเข้าสู่ระบบจัดการสต็อก
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 py-4">
            {/* ชื่อวัตถุดิบ */}
            <div className="grid gap-2">
              <Label
                htmlFor="ingredient-name"
                className="flex items-center gap-1"
              >
                ชื่อวัตถุดิบ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ingredient-name"
                value={newIngredient.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="เช่น เนื้อหมู, หอมแดง, น้ำมันพืช"
                disabled={isSubmitting}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                ชื่อวัตถุดิบควรชัดเจนและง่ายต่อการค้นหา
              </p>
            </div>

            {/* หน่วยนับ */}
            <div className="grid gap-2">
              <Label
                htmlFor="ingredient-unit"
                className="flex items-center gap-1"
              >
                หน่วยนับ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ingredient-unit"
                value={newIngredient.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                placeholder="เช่น กิโลกรัม, ลิตร, ชิ้น, ห่อ, กล่อง"
                disabled={isSubmitting}
                className={errors.unit ? "border-destructive" : ""}
              />
              {errors.unit && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.unit}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                หน่วยที่ใช้ในการวัดหรือนับปริมาณวัตถุดิบ
              </p>
            </div>

            {/* ตัวอย่างหน่วยนับที่แนะนำ */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">หน่วยนับที่แนะนำ:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "กิโลกรัม",
                  "กรัม",
                  "ลิตร",
                  "มิลลิลิตร",
                  "ชิ้น",
                  "ห่อ",
                  "กล่อง",
                  "ถุง",
                ].map((unit) => (
                  <Button
                    key={unit}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleInputChange("unit", unit)}
                    disabled={isSubmitting}
                  >
                    {unit}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={
                !newIngredient.name.trim() ||
                !newIngredient.unit.trim() ||
                isSubmitting
              }
              className="min-w-24"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-background/20 border-t-background rounded-full mr-2" />
                  กำลังเพิ่ม...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มวัตถุดิบ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
