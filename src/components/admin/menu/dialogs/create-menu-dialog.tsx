"use client";

import type React from "react";

import { useState, useRef } from "react";
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
import type { MenuCategory, NewMenuItemDto } from "@/interfaces/menu.interface";
import { Plus, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface CreateMenuDialogProps {
  newMenuItem: NewMenuItemDto;
  setNewMenuItem: (item: NewMenuItemDto) => void;
  handleAddMenuItem: (file?: File) => Promise<void>;
  categories: MenuCategory[];
}

export function CreateMenuDialog({
  newMenuItem,
  setNewMenuItem,
  handleAddMenuItem,
  categories,
}: CreateMenuDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }

      setSelectedFile(file);
      console.log("Selected file:", file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    if (!newMenuItem.name.trim()) {
      toast.error("กรุณากรอกชื่อเมนู");
      return false;
    }

    if (!newMenuItem.description.trim()) {
      toast.error("กรุณากรอกรายละเอียดเมนู");
      return false;
    }

    const price = Number(newMenuItem.price);
    if (isNaN(price) || price <= 0 || newMenuItem.price === 0) {
      toast.error("กรุณากรอกราคาที่ถูกต้อง (ต้องมากกว่า 0)");
      return false;
    }

    if (!newMenuItem.categoryId) {
      toast.error("กรุณาเลือกหมวดหมู่");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Reset the form data
    setNewMenuItem({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      isAvailable: true,
      branchId: newMenuItem.branchId || "",
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass the selected file to the handler
      await handleAddMenuItem(selectedFile || undefined);

      setOpen(false);
      resetForm();
      toast.success("เพิ่มเมนูใหม่สำเร็จ");
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("ไม่สามารถเพิ่มเมนูได้ โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มเมนูใหม่
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มเมนูใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดเมนูที่ต้องการเพิ่ม
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Photo Upload Section */}
          <div className="grid gap-2">
            <Label htmlFor="image">รูปภาพเมนู</Label>
            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      คลิกเพื่อเลือกรูปภาพ
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      รองรับ JPG, PNG, GIF (ขนาดไม่เกิน 5MB)
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting}
              />
              {!imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  เลือกรูปภาพ
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">
              ชื่อเมนู <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={newMenuItem.name}
              onChange={(e) =>
                setNewMenuItem({
                  ...newMenuItem,
                  name: e.target.value,
                })
              }
              disabled={isSubmitting}
              placeholder="กรอกชื่อเมนู"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">
              รายละเอียด <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={newMenuItem.description}
              onChange={(e) =>
                setNewMenuItem({
                  ...newMenuItem,
                  description: e.target.value,
                })
              }
              disabled={isSubmitting}
              placeholder="กรอกรายละเอียดเมนู"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">
              ราคา (บาท) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={newMenuItem.price === 0 ? "" : newMenuItem.price}
              onChange={(e) => {
                const inputValue = e.target.value;

                if (inputValue === "" || inputValue === null) {
                  // ถ้าเป็นค่าว่างให้เซ็ต price เป็น 0
                  setNewMenuItem({
                    ...newMenuItem,
                    price: 0,
                  });
                } else {
                  // แปลงค่าและตรวจสอบว่าเป็นตัวเลขที่ถูกต้อง
                  const numericValue = Number(inputValue);
                  if (!isNaN(numericValue) && numericValue >= 0) {
                    setNewMenuItem({
                      ...newMenuItem,
                      price: numericValue,
                    });
                  }
                }
              }}
              disabled={isSubmitting}
              placeholder="0.00"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">
              หมวดหมู่ <span className="text-red-500">*</span>
            </Label>
            <Select
              value={newMenuItem.categoryId}
              onValueChange={(value) =>
                setNewMenuItem({ ...newMenuItem, categoryId: value })
              }
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
            <Label htmlFor="available">พร้อมขาย</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มเมนู"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
