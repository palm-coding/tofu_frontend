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
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateCategoriesDialogProps {
  newCategory: string;
  setNewCategory: (category: string) => void;
  handleAddCategory: () => Promise<void>;
}

export function CreateCategoriesDialog({
  newCategory,
  setNewCategory,
  handleAddCategory,
}: CreateCategoriesDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      await handleAddCategory();
      setOpen(false);
      toast.success("เพิ่มหมวดหมู่ใหม่สำเร็จ");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("ไม่สามารถเพิ่มหมวดหมู่ได้ โปรดลองใหม่อีกครั้ง");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มหมวดหมู่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
          <DialogDescription>กรอกชื่อหมวดหมู่ที่ต้องการเพิ่ม</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category-name">ชื่อหมวดหมู่</Label>
            <Input
              id="category-name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            เพิ่มหมวดหมู่
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
