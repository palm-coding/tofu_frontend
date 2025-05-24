"use client";

import { useState } from "react";
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
import { Edit, Plus, Trash } from "lucide-react";
import Image from "next/image";

interface MenuManagementProps {
  branchId: string;
}

// Mock data for menu categories
const mockCategories = [
  { id: "cat1", name: "เครื่องดื่ม" },
  { id: "cat2", name: "ของทานเล่น" },
  { id: "cat3", name: "ของหวาน" },
];

// Mock data for menu items
const mockMenuItems = [
  {
    id: "item1",
    name: "น้ำเต้าหู้ร้อน",
    description: "น้ำเต้าหู้ร้อนสูตรดั้งเดิม",
    price: 25,
    categoryId: "cat1",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "item2",
    name: "น้ำเต้าหู้เย็น",
    description: "น้ำเต้าหู้เย็นหวานชื่นใจ",
    price: 30,
    categoryId: "cat1",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "item3",
    name: "น้ำเต้าหู้ปั่น",
    description: "น้ำเต้าหู้ปั่นเข้มข้น",
    price: 35,
    categoryId: "cat1",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "item4",
    name: "ปาท่องโก๋",
    description: "ปาท่องโก๋ทอดกรอบ",
    price: 10,
    categoryId: "cat2",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "item5",
    name: "ขนมไข่",
    description: "ขนมไข่หอมนุ่ม",
    price: 15,
    categoryId: "cat2",
    isAvailable: false,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "item6",
    name: "เต้าฮวยฟรุตสลัด",
    description: "เต้าฮวยราดผลไม้รวม",
    price: 45,
    categoryId: "cat3",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=100&width=100",
  },
];

export function MenuDisplay({ branchId }: MenuManagementProps) {
  const [categories, setCategories] = useState(mockCategories);
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [activeTab, setActiveTab] = useState("menu");

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [newMenuItem, setNewMenuItem] = useState<any>({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isAvailable: true,
    imageUrl: "/placeholder.svg?height=200&width=200",
  });
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);

  // Category functions
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;

    const newCategoryObj = {
      id: `cat${Date.now()}`,
      name: newCategory,
    };

    setCategories([...categories, newCategoryObj]);
    setNewCategory("");
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    const updatedCategories = categories.map((cat) =>
      cat.id === editingCategory.id
        ? { ...cat, name: editingCategory.name }
        : cat
    );

    setCategories(updatedCategories);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Check if there are menu items using this category
    const hasItems = menuItems.some((item) => item.categoryId === categoryId);

    if (hasItems) {
      alert("ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีเมนูอยู่ในหมวดหมู่นี้");
      return;
    }

    const updatedCategories = categories.filter((cat) => cat.id !== categoryId);
    setCategories(updatedCategories);
  };

  // Menu item functions
  const handleAddMenuItem = () => {
    if (
      !newMenuItem.name.trim() ||
      !newMenuItem.categoryId ||
      !newMenuItem.price
    )
      return;

    const newMenuItemObj = {
      id: `item${Date.now()}`,
      ...newMenuItem,
      price: Number(newMenuItem.price),
    };

    setMenuItems([...menuItems, newMenuItemObj]);
    setNewMenuItem({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      isAvailable: true,
      imageUrl: "/placeholder.svg?height=200&width=200",
    });
  };

  const handleUpdateMenuItem = () => {
    if (
      !editingMenuItem ||
      !editingMenuItem.name.trim() ||
      !editingMenuItem.categoryId ||
      !editingMenuItem.price
    )
      return;

    const updatedMenuItems = menuItems.map((item) =>
      item.id === editingMenuItem.id
        ? { ...editingMenuItem, price: Number(editingMenuItem.price) }
        : item
    );

    setMenuItems(updatedMenuItems);
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    const updatedMenuItems = menuItems.filter((item) => item.id !== itemId);
    setMenuItems(updatedMenuItems);
  };

  const handleToggleAvailability = (itemId: string) => {
    const updatedMenuItems = menuItems.map((item) =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );

    setMenuItems(updatedMenuItems);
  };

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
                                      price: e.target.value,
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
