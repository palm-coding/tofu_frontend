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
import type {
  Ingredient,
  Stock,
  CreateIngredientDto,
} from "@/interfaces/stock.interface";

interface AddIngredientDialogProps {
  ingredients: Ingredient[];
  setIngredients: (value: Ingredient[]) => void;
  stocks: Stock[];
  setStocks: (value: Stock[]) => void;
  branchId?: string;
}

export function AddIngredientDialog({
  ingredients,
  setIngredients,
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

  const handleSubmit = async () => {
    if (!newIngredient.name.trim() || !newIngredient.unit.trim()) return;

    try {
      setLoading(true);

      // Add new ingredient
      const response = await stockService.addIngredient(newIngredient);
      setIngredients([...ingredients, response.ingredient]);

      if (!branchId) {
        console.error("Branch ID is required to create stock");
        return;
      }

      // Create initial stock for this ingredient
      const stockResponse = await stockService.createStock(
        branchId,
        response.ingredient.id
      );
      setStocks([...stocks, stockResponse.stock]);

      // Reset form and close dialog
      setNewIngredient({ name: "", unit: "" });
      setOpen(false);
    } catch (error) {
      console.error("Failed to add ingredient:", error);
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
                setNewIngredient({
                  ...newIngredient,
                  name: e.target.value,
                })
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
                setNewIngredient({
                  ...newIngredient,
                  unit: e.target.value,
                })
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
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !newIngredient.name.trim() ||
              !newIngredient.unit.trim()
            }
          >
            {loading ? "กำลังเพิ่ม..." : "เพิ่มวัตถุดิบ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
