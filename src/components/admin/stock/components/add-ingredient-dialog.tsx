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
import { Plus } from "lucide-react";
import { stockService } from "@/services/stock.service";
import { ingredientService } from "@/services/ingredient.service";
import type { CreateIngredientDto } from "@/interfaces/ingredient.interface";
import type { Stock } from "@/interfaces/stock.interface";

interface AddIngredientDialogProps {
  stocks: Stock[];
  setStocks: (value: Stock[]) => void;
  branchId: string;
}

export function AddIngredientDialog({
  stocks,
  setStocks,
  branchId,
}: AddIngredientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newIngredient, setNewIngredient] = useState<CreateIngredientDto>({
    name: "",
    unit: "",
  });

  const isValid =
    newIngredient.name.trim() !== "" && newIngredient.unit.trim() !== "";

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      setLoading(true);

      // 1. Add new ingredient with proper response validation
      const ingredientResponse = await ingredientService.addIngredient(
        newIngredient
      );

      // Validate ingredient response structure
      if (
        !ingredientResponse ||
        !ingredientResponse.ingredient ||
        !ingredientResponse.ingredient.id
      ) {
        console.error(
          "❌ Invalid ingredient response structure:",
          ingredientResponse
        );
        throw new Error("Invalid response from ingredient service");
      }

      const ingredientId = ingredientResponse.ingredient.id;
      console.log("✅ Ingredient created successfully:", ingredientId);

      // 2. Create stock for this ingredient with proper response validation
      const stockResponse = await stockService.createStock(
        branchId,
        ingredientId
      );

      // Validate stock response structure
      if (!stockResponse || !stockResponse.stock) {
        console.error("❌ Invalid stock response structure:", stockResponse);
        throw new Error("Invalid response from stock service");
      }

      console.log("✅ Stock created successfully:", stockResponse.stock);

      // 3. Update stock state
      setStocks([...stocks, stockResponse.stock]);

      // 4. Reset form and close dialog
      setNewIngredient({ name: "", unit: "" });
      setOpen(false);

      console.log("✅ Ingredient and stock added successfully");
    } catch (error: any) {
      console.error("❌ Failed to add ingredient:");

      if (error.response) {
        console.error("🔴 Server responded with:", error.response.data);
        console.error("🔴 Status code:", error.response.status);
        console.error("🔴 Headers:", error.response.headers);
      } else if (error.request) {
        console.error("🟠 No response received:", error.request);
      } else {
        console.error("⚠️ Error setting up request:", error.message);
      }

      // Optional: Show user-friendly error message
      // You could add a toast notification here or set an error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มวัตถุดิบ
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มวัตถุดิบใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดวัตถุดิบที่ต้องการเพิ่มเข้าสู่ระบบ
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ingredient-name">ชื่อวัตถุดิบ</Label>
            <Input
              id="ingredient-name"
              placeholder="เช่น แป้งสาลี, น้ำตาล, เนื้อหมู"
              value={newIngredient.name}
              onChange={(e) =>
                setNewIngredient((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ingredient-unit">หน่วยนับ</Label>
            <Input
              id="ingredient-unit"
              placeholder="เช่น กิโลกรัม, ลิตร, กล่อง, ถุง"
              value={newIngredient.unit}
              onChange={(e) =>
                setNewIngredient((prev) => ({
                  ...prev,
                  unit: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !isValid}>
            {loading ? "กำลังเพิ่ม..." : "เพิ่มวัตถุดิบ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
