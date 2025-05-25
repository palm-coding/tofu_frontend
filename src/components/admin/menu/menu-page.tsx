"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Edit, Loader2, Plus, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { menuService } from "@/services/menu.service";
import {
  MenuCategory,
  MenuItem,
  NewMenuItemDto,
} from "@/interfaces/menu.interface";

interface MenuManagementProps {
  branchId: string;
}

export function MenuDisplay({ branchId }: MenuManagementProps) {
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
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=200&width=200",
  });
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories and menu items
        const [categoriesResponse, menuItemsResponse] = await Promise.all([
          menuService.getCategories(branchId),
          menuService.getMenuItems(branchId),
        ]);

        setCategories(categoriesResponse.categories);
        setMenuItems(menuItemsResponse.items);
      } catch (err) {
        console.error("Error loading menu data:", err);
        setError("ไม่สามารถโหลดข้อมูลเมนูได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  // Category functions
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await menuService.createCategory(branchId, newCategory);
      setCategories([...categories, response.category]);
      setNewCategory("");
    } catch (err) {
      console.error("Failed to add category:", err);
      setError("ไม่สามารถเพิ่มหมวดหมู่ได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      const response = await menuService.updateCategory(
        branchId,
        editingCategory.id,
        editingCategory.name
      );

      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id ? response.category : cat
      );

      setCategories(updatedCategories);
      setEditingCategory(null);
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

      await menuService.deleteCategory(branchId, categoryId);
      const updatedCategories = categories.filter(
        (cat) => cat.id !== categoryId
      );
      setCategories(updatedCategories);
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

    try {
      const response = await menuService.createMenuItem(branchId, newMenuItem);
      setMenuItems([...menuItems, response.item]);
      setNewMenuItem({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        isAvailable: true,
        imageUrl: "/placeholder.svg?height=200&width=200",
      });
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
      const response = await menuService.updateMenuItem(
        branchId,
        editingMenuItem.id,
        editingMenuItem
      );

      const updatedMenuItems = menuItems.map((item) =>
        item.id === editingMenuItem.id ? response.item : item
      );

      setMenuItems(updatedMenuItems);
      setEditingMenuItem(null);
    } catch (err) {
      console.error("Failed to update menu item:", err);
      setError("ไม่สามารถแก้ไขเมนูได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await menuService.deleteMenuItem(branchId, itemId);
      const updatedMenuItems = menuItems.filter((item) => item.id !== itemId);
      setMenuItems(updatedMenuItems);
    } catch (err) {
      console.error("Failed to delete menu item:", err);
      setError("ไม่สามารถลบเมนูได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const response = await menuService.toggleMenuItemAvailability(
        branchId,
        itemId
      );
      const updatedMenuItems = menuItems.map((item) =>
        item.id === itemId ? response.item : item
      );
      setMenuItems(updatedMenuItems);
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">รายการเมนูทั้งหมด</h2>

              <Dialog>
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
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
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
                    <Button type="submit" onClick={handleAddMenuItem}>
                      เพิ่มเมนู
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <Card
                  key={item.id}
                  className={!item.isAvailable ? "opacity-60" : ""}
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>
                          {
                            categories.find((cat) => cat.id === item.categoryId)
                              ?.name
                          }
                        </CardDescription>
                      </div>
                      <div className="text-lg font-semibold text-amber-600">
                        ฿{item.price}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`available-${item.id}`}
                        checked={item.isAvailable}
                        onCheckedChange={() =>
                          handleToggleAvailability(item.id)
                        }
                      />
                      <Label
                        htmlFor={`available-${item.id}`}
                        className="text-sm"
                      >
                        {item.isAvailable ? "พร้อมขาย" : "ไม่พร้อมขาย"}
                      </Label>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingMenuItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>แก้ไขเมนู</DialogTitle>
                            <DialogDescription>
                              แก้ไขรายละเอียดเมนู
                            </DialogDescription>
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
                                <Label htmlFor="edit-description">
                                  รายละเอียด
                                </Label>
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
                                    {categories.map((category) => (
                                      <SelectItem
                                        key={category.id}
                                        value={category.id}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))}
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
                            <Button
                              type="submit"
                              onClick={handleUpdateMenuItem}
                            >
                              บันทึก
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteMenuItem(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">หมวดหมู่ทั้งหมด</h2>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มหมวดหมู่
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
                    <DialogDescription>
                      กรอกชื่อหมวดหมู่ที่ต้องการเพิ่ม
                    </DialogDescription>
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
                    <Button type="submit" onClick={handleAddCategory}>
                      เพิ่มหมวดหมู่
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const itemCount = menuItems.filter(
                  (item) => item.categoryId === category.id
                ).length;

                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>
                        {itemCount} รายการในหมวดหมู่นี้
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
                            <DialogDescription>
                              แก้ไขชื่อหมวดหมู่
                            </DialogDescription>
                          </DialogHeader>
                          {editingCategory && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-category-name">
                                  ชื่อหมวดหมู่
                                </Label>
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
                            <Button
                              type="submit"
                              onClick={handleUpdateCategory}
                            >
                              บันทึก
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={itemCount > 0}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
