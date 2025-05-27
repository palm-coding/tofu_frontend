"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { menuService } from "@/services/menu.service";
import {
  MenuCategory,
  MenuItem,
  NewMenuItemDto,
} from "@/interfaces/menu.interface";
import { Branch } from "@/interfaces/branch.interface";
import { MenuTab } from "./tabs/menu-tab";
import { CategoriesTab } from "./tabs/categories-tab";
import { toast } from "sonner";

interface MenuManagementProps {
  branchCode: string;
  branchId?: string;
  branch?: Branch | null;
}

export function MenuDisplay({ branchId }: MenuManagementProps) {
  console.log("[Menu] branchId:", branchId);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState("menu");
  console.log("activeTab", activeTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null
  );

  const [newMenuItem, setNewMenuItem] = useState<NewMenuItemDto>({
    branchId: branchId || "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=200&width=200",
  });
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Load data useEffect
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        if (!branchId) {
          setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
          return;
        }

        // Fetch data from API
        const [categoriesResponse, menuItemsResponse] = await Promise.all([
          menuService.getCategories(branchId),
          menuService.getMenuItems(branchId),
        ]);

        console.log("Categories response:", categoriesResponse);
        console.log("Menu items response:", menuItemsResponse);

        // ตรวจสอบประเภทข้อมูลที่ได้รับ
        // กรณีที่ API ส่ง array โดยตรง
        if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse);
          console.log(
            "Setting categories from array:",
            categoriesResponse.length
          );
        }
        // กรณี API ส่งเป็น {categories: [...]}
        else if (categoriesResponse && categoriesResponse.categories) {
          setCategories(categoriesResponse.categories);
          console.log(
            "Setting categories from object:",
            categoriesResponse.categories.length
          );
        }
        // กรณีไม่ใช่ทั้งสองรูปแบบ
        else {
          console.warn(
            "Invalid categories response format:",
            categoriesResponse
          );
          setCategories([]);
        }

        // ตรวจสอบประเภทข้อมูลที่ได้รับสำหรับเมนู
        // กรณีที่ API ส่ง array โดยตรง
        if (Array.isArray(menuItemsResponse)) {
          setMenuItems(menuItemsResponse);
          console.log(
            "Setting menu items from array:",
            menuItemsResponse.length
          );
        }
        // กรณี API ส่งเป็น {items: [...]}
        else if (menuItemsResponse && menuItemsResponse.items) {
          setMenuItems(menuItemsResponse.items);
          console.log(
            "Setting menu items from object:",
            menuItemsResponse.items.length
          );
        }
        // กรณีไม่ใช่ทั้งสองรูปแบบ
        else {
          console.warn(
            "Invalid menu items response format:",
            menuItemsResponse
          );
          setMenuItems([]);
        }
      } catch (err) {
        console.error("Error loading menu data:", err);
        setError("ไม่สามารถโหลดข้อมูลเมนูได้ กรุณาลองอีกครั้ง");
        setCategories([]);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  // Category functions
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (!branchId) {
      setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
      return;
    }

    try {
      const response = await menuService.createCategory(branchId, newCategory);
      // ตรวจสอบรูปแบบการตอบกลับ
      const newCategoryData = response.category || response;
      setCategories([...categories, newCategoryData]);
      setNewCategory("");
      toast.success("เพิ่มหมวดหมู่ใหม่สำเร็จ");
    } catch (err) {
      console.error("Failed to add category:", err);
      setError("ไม่สามารถเพิ่มหมวดหมู่ได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      const response = await menuService.updateCategory(
        editingCategory._id,
        editingCategory.name
      );

      // ตรวจสอบรูปแบบการตอบกลับ
      const updatedCategoryData = response.category || response;

      const updatedCategories = categories.map((cat) =>
        cat._id === editingCategory._id ? updatedCategoryData : cat
      );

      setCategories(updatedCategories);
      setEditingCategory(null);
      toast.success("แก้ไขหมวดหมู่สำเร็จ");
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("ไม่สามารถแก้ไขหมวดหมู่ได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Check if there are menu items using this category
      const hasItems = menuItems.some((item) => item.categoryId === categoryId);

      if (hasItems) {
        alert("ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีเมนูอยู่ในหมวดหมู่นี้");
        return;
      }

      await menuService.deleteCategory(categoryId);
      const updatedCategories = categories.filter(
        (cat) => cat._id !== categoryId
      );
      setCategories(updatedCategories);
      toast.success("ลบหมวดหมู่สำเร็จ");
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("ไม่สามารถลบหมวดหมู่ได้ กรุณาลองอีกครั้ง");
    }
  };

  // Menu item functions
  const handleAddMenuItem = async () => {
    if (
      !newMenuItem.name.trim() ||
      !newMenuItem.categoryId ||
      !newMenuItem.price
    )
      return;
    if (!branchId) {
      setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
      return;
    }

    try {
      // อัพเดท branchId เพื่อให้แน่ใจว่าใช้ค่าล่าสุด
      const itemToCreate = {
        ...newMenuItem,
        branchId: branchId,
      };

      const response = await menuService.createMenuItem(itemToCreate);

      // ตรวจสอบรูปแบบการตอบกลับ
      const newMenuItemData = response.item || response;

      setMenuItems([...menuItems, newMenuItemData]);
      setNewMenuItem({
        branchId: branchId,
        name: "",
        description: "",
        price: "",
        categoryId: "",
        isAvailable: true,
        imageUrl: "/placeholder.svg?height=200&width=200",
      });

      toast.success("เพิ่มเมนูใหม่สำเร็จ");
    } catch (err) {
      console.error("Failed to add menu item:", err);
      setError("ไม่สามารถเพิ่มเมนูได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleUpdateMenuItem = async () => {
    if (
      !editingMenuItem ||
      !editingMenuItem.name.trim() ||
      !editingMenuItem.categoryId
    )
      return;

    try {
      // สร้าง object ใหม่ที่มีเฉพาะข้อมูลที่ต้องการอัพเดท
      const updateData = {
        name: editingMenuItem.name,
        description: editingMenuItem.description,
        price: editingMenuItem.price,
        categoryId: editingMenuItem.categoryId,
        isAvailable: editingMenuItem.isAvailable,
        imageUrl: editingMenuItem.imageUrl,
      };

      const response = await menuService.updateMenuItem(
        editingMenuItem._id,
        updateData
      );

      // ตรวจสอบรูปแบบการตอบกลับ
      const updatedMenuItemData = response.item || response;

      const updatedMenuItems = menuItems.map((item) =>
        item._id === editingMenuItem._id ? updatedMenuItemData : item
      );

      setMenuItems(updatedMenuItems);
      setEditingMenuItem(null);
      toast.success("แก้ไขเมนูสำเร็จ");
    } catch (err) {
      console.error("Failed to update menu item:", err);
      setError("ไม่สามารถแก้ไขเมนูได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await menuService.deleteMenuItem(itemId);
      const updatedMenuItems = menuItems.filter((item) => item._id !== itemId);
      setMenuItems(updatedMenuItems);
      toast.success("ลบเมนูสำเร็จ");
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      setError("ไม่สามารถลบเมนูได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const response = await menuService.toggleMenuItemAvailability(itemId);

      // ตรวจสอบรูปแบบการตอบกลับ
      const updatedMenuItemData = response.item || response;
      const isAvailable = updatedMenuItemData.isAvailable;

      const updatedMenuItems = menuItems.map((item) =>
        item._id === itemId ? updatedMenuItemData : item
      );
      setMenuItems(updatedMenuItems);
      toast.success(
        isAvailable ? "เมนูพร้อมขายแล้ว" : "เมนูถูกตั้งเป็นไม่พร้อมขาย"
      );
    } catch (err) {
      console.error("Failed to toggle menu item availability:", err);
      setError("ไม่สามารถเปลี่ยนสถานะเมนูได้ กรุณาลองอีกครั้ง");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>กำลังโหลดข้อมูลเมนู...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            ลองใหม่
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">จัดการเมนู</h1>
          <p className="text-muted-foreground">
            จัดการหมวดหมู่และรายการเมนูของร้าน
          </p>
          {/* แสดงข้อมูลเพื่อการ debug */}
          <p className="text-xs text-muted-foreground">
            หมวดหมู่: {categories?.length || 0} รายการ, เมนู:{" "}
            {menuItems?.length || 0} รายการ
          </p>
        </div>

        <Tabs
          defaultValue="menu"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="menu">รายการเมนู</TabsTrigger>
            <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            <MenuTab
              menuItems={menuItems}
              categories={categories}
              newMenuItem={newMenuItem}
              setNewMenuItem={setNewMenuItem}
              editingMenuItem={editingMenuItem}
              setEditingMenuItem={setEditingMenuItem}
              handleAddMenuItem={handleAddMenuItem}
              handleUpdateMenuItem={handleUpdateMenuItem}
              handleDeleteMenuItem={handleDeleteMenuItem}
              handleToggleAvailability={handleToggleAvailability}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoriesTab
              categories={categories}
              menuItems={menuItems}
              newCategory={newCategory}
              setNewCategory={setNewCategory}
              editingCategory={editingCategory}
              setEditingCategory={setEditingCategory}
              handleAddCategory={handleAddCategory}
              handleUpdateCategory={handleUpdateCategory}
              handleDeleteCategory={handleDeleteCategory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
