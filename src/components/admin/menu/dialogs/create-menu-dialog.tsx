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
import { MenuCategory, NewMenuItemDto } from "@/interfaces/menu.interface";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateMenuDialogProps {
  newMenuItem: NewMenuItemDto;
  setNewMenuItem: (item: NewMenuItemDto) => void;
  handleAddMenuItem: () => Promise<void>;
  categories: MenuCategory[];
}

export function CreateMenuDialog({
  newMenuItem,
  setNewMenuItem,
  handleAddMenuItem,
  categories,
}: CreateMenuDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      await handleAddMenuItem();
      setOpen(false);
      toast.success("เพิ่มเมนูใหม่สำเร็จ");
    } catch (error) {
        console.error("Error adding menu item:", error);
      toast.error("ไม่สามารถเพิ่มเมนูได้ โปรดลองใหม่อีกครั้ง");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มเมนูใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มเมนูใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดเมนูที่ต้องการเพิ่ม
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">ชื่อเมนู</Label>
            <Input
              id="name"
              value={newMenuItem.name}
              onChange={(e) =>
                setNewMenuItem({
                  ...newMenuItem,
                  name: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              value={newMenuItem.description}
              onChange={(e) =>
                setNewMenuItem({
                  ...newMenuItem,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">ราคา (บาท)</Label>
            <Input
              id="price"
              type="number"
              value={newMenuItem.price}
              onChange={(e) =>
                setNewMenuItem({
                  ...newMenuItem,
                  price: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">หมวดหมู่</Label>
            <Select
              value={newMenuItem.categoryId}
              onValueChange={(value) =>
                setNewMenuItem({ ...newMenuItem, categoryId: value })
              }
            >
              <SelectTrigger id="category">
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
              id="available"
              checked={newMenuItem.isAvailable}
              onCheckedChange={(checked) =>
                setNewMenuItem({
                  ...newMenuItem,
                  isAvailable: checked,
                })
              }
            />
            <Label htmlFor="available">พร้อมขาย</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            เพิ่มเมนู
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
