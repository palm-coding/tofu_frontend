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
import { MenuCategory } from "@/interfaces/menu.interface";
import { Edit } from "lucide-react";
import { toast } from "sonner";

interface EditCategoriesDialogProps {
  category: MenuCategory;
  editingCategory: MenuCategory | null;
  setEditingCategory: (category: MenuCategory | null) => void;
  handleUpdateCategory: () => Promise<void>;
}

export function EditCategoriesDialog({
  category,
  editingCategory,
  setEditingCategory,
  handleUpdateCategory,
}: EditCategoriesDialogProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // ถ้า dialog ปิด ให้ล้างค่าที่กำลังแก้ไข
      setEditingCategory(null);
    }
  };

  const handleEdit = () => {
    setEditingCategory(category);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await handleUpdateCategory();
      setOpen(false);
      toast.success("แก้ไขหมวดหมู่สำเร็จ");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("ไม่สามารถแก้ไขหมวดหมู่ได้ โปรดลองใหม่อีกครั้ง");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" onClick={handleEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
          <DialogDescription>แก้ไขชื่อหมวดหมู่</DialogDescription>
        </DialogHeader>
        {editingCategory && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-category-name">ชื่อหมวดหมู่</Label>
              <Input
                id="edit-category-name"
                value={editingCategory.name}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    name: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            บันทึก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
