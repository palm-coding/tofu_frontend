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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MenuCategory, MenuItem } from "@/interfaces/menu.interface";
import { Edit } from "lucide-react";
import { toast } from "sonner";

interface EditMenuDialogProps {
  item: MenuItem;
  editingMenuItem: MenuItem | null;
  setEditingMenuItem: (item: MenuItem | null) => void;
  handleUpdateMenuItem: () => Promise<void>;
  categories: MenuCategory[];
}

export function EditMenuDialog({
  item,
  editingMenuItem,
  setEditingMenuItem,
  handleUpdateMenuItem,
  categories,
}: EditMenuDialogProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // ถ้า dialog ปิด ให้ล้างค่าที่กำลังแก้ไข
      setEditingMenuItem(null);
    }
  };

  const handleEdit = () => {
    setEditingMenuItem(item);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await handleUpdateMenuItem();
      setOpen(false);
      toast.success("แก้ไขเมนูสำเร็จ");
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("ไม่สามารถแก้ไขเมนูได้ โปรดลองใหม่อีกครั้ง");
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
          <DialogTitle>แก้ไขเมนู</DialogTitle>
          <DialogDescription>แก้ไขรายละเอียดเมนู</DialogDescription>
        </DialogHeader>
        {editingMenuItem && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">ชื่อเมนู</Label>
              <Input
                id="edit-name"
                value={editingMenuItem.name}
                onChange={(e) =>
                  setEditingMenuItem({
                    ...editingMenuItem,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">รายละเอียด</Label>
              <Textarea
                id="edit-description"
                value={editingMenuItem.description}
                onChange={(e) =>
                  setEditingMenuItem({
                    ...editingMenuItem,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">ราคา (บาท)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editingMenuItem.price}
                onChange={(e) =>
                  setEditingMenuItem({
                    ...editingMenuItem,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">หมวดหมู่</Label>
              <Select
                value={editingMenuItem.categoryId}
                onValueChange={(value) =>
                  setEditingMenuItem({
                    ...editingMenuItem,
                    categoryId: value,
                  })
                }
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      ไม่พบหมวดหมู่
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-available"
                checked={editingMenuItem.isAvailable}
                onCheckedChange={(checked) =>
                  setEditingMenuItem({
                    ...editingMenuItem,
                    isAvailable: checked,
                  })
                }
              />
              <Label htmlFor="edit-available">พร้อมขาย</Label>
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
