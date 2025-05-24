"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit, Plus, Trash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StockManagementProps {
  branchId: string;
}

// Mock data for ingredients
const mockIngredients = [
  { id: "ing1", name: "ถั่วเหลือง", unit: "กิโลกรัม" },
  { id: "ing2", name: "น้ำตาล", unit: "กิโลกรัม" },
  { id: "ing3", name: "แป้ง", unit: "กิโลกรัม" },
  { id: "ing4", name: "น้ำแข็ง", unit: "กิโลกรัม" },
  { id: "ing5", name: "นมข้นหวาน", unit: "กระป๋อง" },
];

// Mock data for stock
const mockStocks = [
  {
    id: "stock1",
    branchId: "branch1",
    ingredientId: "ing1",
    quantity: 25,
    lowThreshold: 5,
  },
  {
    id: "stock2",
    branchId: "branch1",
    ingredientId: "ing2",
    quantity: 10,
    lowThreshold: 3,
  },
  {
    id: "stock3",
    branchId: "branch1",
    ingredientId: "ing3",
    quantity: 15,
    lowThreshold: 5,
  },
  {
    id: "stock4",
    branchId: "branch1",
    ingredientId: "ing4",
    quantity: 2,
    lowThreshold: 5,
  },
  {
    id: "stock5",
    branchId: "branch1",
    ingredientId: "ing5",
    quantity: 8,
    lowThreshold: 3,
  },
];

export function StockDisplay({ branchId }: StockManagementProps) {
  const [ingredients, setIngredients] = useState(mockIngredients);
  const [stocks, setStocks] = useState(mockStocks);

  const [newIngredient, setNewIngredient] = useState({ name: "", unit: "" });
  const [editingIngredient, setEditingIngredient] = useState<any>(null);

  const [adjustingStock, setAdjustingStock] = useState<any>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");

  const [editingThreshold, setEditingThreshold] = useState<any>(null);
  const [newThreshold, setNewThreshold] = useState<string>("");

  // Ingredient functions
  const handleAddIngredient = () => {
    if (!newIngredient.name.trim() || !newIngredient.unit.trim()) return;

    const newIngredientObj = {
      id: `ing${Date.now()}`,
      ...newIngredient,
    };

    setIngredients([...ingredients, newIngredientObj]);

    // Also add to stock with 0 quantity
    const newStockObj = {
      id: `stock${Date.now()}`,
      branchId,
      ingredientId: newIngredientObj.id,
      quantity: 0,
      lowThreshold: 5,
    };

    setStocks([...stocks, newStockObj]);

    setNewIngredient({ name: "", unit: "" });
  };

  const handleUpdateIngredient = () => {
    if (
      !editingIngredient ||
      !editingIngredient.name.trim() ||
      !editingIngredient.unit.trim()
    )
      return;

    const updatedIngredients = ingredients.map((ing) =>
      ing.id === editingIngredient.id
        ? { ...ing, name: editingIngredient.name, unit: editingIngredient.unit }
        : ing
    );

    setIngredients(updatedIngredients);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (ingredientId: string) => {
    // Remove ingredient
    const updatedIngredients = ingredients.filter(
      (ing) => ing.id !== ingredientId
    );
    setIngredients(updatedIngredients);

    // Also remove from stock
    const updatedStocks = stocks.filter(
      (stock) => stock.ingredientId !== ingredientId
    );
    setStocks(updatedStocks);
  };

  // Stock functions
  const handleAdjustStock = () => {
    if (
      !adjustingStock ||
      !adjustmentQuantity ||
      isNaN(Number(adjustmentQuantity)) ||
      Number(adjustmentQuantity) <= 0
    )
      return;

    const quantity = Number(adjustmentQuantity);

    const updatedStocks = stocks.map((stock) => {
      if (stock.id === adjustingStock.id) {
        return {
          ...stock,
          quantity:
            adjustmentType === "add"
              ? stock.quantity + quantity
              : Math.max(0, stock.quantity - quantity),
        };
      }
      return stock;
    });

    setStocks(updatedStocks);
    setAdjustingStock(null);
    setAdjustmentQuantity("");
    setAdjustmentType("add");
  };

  const handleUpdateThreshold = () => {
    if (
      !editingThreshold ||
      !newThreshold ||
      isNaN(Number(newThreshold)) ||
      Number(newThreshold) < 0
    )
      return;

    const threshold = Number(newThreshold);

    const updatedStocks = stocks.map((stock) => {
      if (stock.id === editingThreshold.id) {
        return {
          ...stock,
          lowThreshold: threshold,
        };
      }
      return stock;
    });

    setStocks(updatedStocks);
    setEditingThreshold(null);
    setNewThreshold("");
  };

  // Helper function to get ingredient name by id
  const getIngredientName = (ingredientId: string) => {
    return (
      ingredients.find((ing) => ing.id === ingredientId)?.name || "ไม่ทราบชื่อ"
    );
  };

  // Helper function to get ingredient unit by id
  const getIngredientUnit = (ingredientId: string) => {
    return ingredients.find((ing) => ing.id === ingredientId)?.unit || "หน่วย";
  };

  // Get low stock items
  const lowStockItems = stocks.filter(
    (stock) => stock.quantity <= stock.lowThreshold
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">จัดการสต็อก</h1>
          <p className="text-muted-foreground">จัดการวัตถุดิบและสต็อกของร้าน</p>
        </div>

        {lowStockItems.length > 0 && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">
              แจ้งเตือนสต็อกใกล้หมด
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              มีวัตถุดิบ {lowStockItems.length} รายการที่ใกล้หมด
              กรุณาตรวจสอบและเพิ่มสต็อก
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">รายการวัตถุดิบทั้งหมด</h2>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มวัตถุดิบใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>เพิ่มวัตถุดิบใหม่</DialogTitle>
                <DialogDescription>
                  กรอกรายละเอียดวัตถุดิบที่ต้องการเพิ่ม
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ingredient-name">ชื่อวัตถุดิบ</Label>
                  <Input
                    id="ingredient-name"
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
                  <Label htmlFor="ingredient-unit">หน่วย</Label>
                  <Input
                    id="ingredient-unit"
                    value={newIngredient.unit}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        unit: e.target.value,
                      })
                    }
                    placeholder="เช่น กิโลกรัม, ลิตร, กล่อง"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddIngredient}>
                  เพิ่มวัตถุดิบ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วัตถุดิบ</TableHead>
                  <TableHead>หน่วย</TableHead>
                  <TableHead className="text-right">จำนวนคงเหลือ</TableHead>
                  <TableHead className="text-right">
                    แจ้งเตือนเมื่อต่ำกว่า
                  </TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks
                  .filter((stock) => stock.branchId === branchId)
                  .map((stock) => {
                    const ingredient = ingredients.find(
                      (ing) => ing.id === stock.ingredientId
                    );
                    if (!ingredient) return null;

                    const isLowStock = stock.quantity <= stock.lowThreshold;

                    return (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">
                          {ingredient.name}
                        </TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              isLowStock ? "text-red-600 font-medium" : ""
                            }
                          >
                            {stock.quantity}
                          </span>
                          {isLowStock && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-red-100 text-red-800 hover:bg-red-100"
                            >
                              ใกล้หมด
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <span>{stock.lowThreshold}</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-2"
                                  onClick={() => {
                                    setEditingThreshold(stock);
                                    setNewThreshold(
                                      stock.lowThreshold.toString()
                                    );
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>ตั้งค่าการแจ้งเตือน</DialogTitle>
                                  <DialogDescription>
                                    กำหนดจำนวนขั้นต่ำที่ต้องการให้แจ้งเตือน
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="threshold">
                                      แจ้งเตือนเมื่อต่ำกว่า ({ingredient.unit})
                                    </Label>
                                    <Input
                                      id="threshold"
                                      type="number"
                                      min="0"
                                      value={newThreshold}
                                      onChange={(e) =>
                                        setNewThreshold(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    onClick={handleUpdateThreshold}
                                  >
                                    บันทึก
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setAdjustingStock(stock);
                                    setAdjustmentQuantity("");
                                    setAdjustmentType("add");
                                  }}
                                >
                                  ปรับสต็อก
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>
                                    ปรับสต็อก{" "}
                                    {getIngredientName(stock.ingredientId)}
                                  </DialogTitle>
                                  <DialogDescription>
                                    เพิ่มหรือลดจำนวนวัตถุดิบในสต็อก
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="flex items-center space-x-4">
                                    <Button
                                      variant={
                                        adjustmentType === "add"
                                          ? "default"
                                          : "outline"
                                      }
                                      className={
                                        adjustmentType === "add"
                                          ? "bg-green-600 hover:bg-green-700"
                                          : ""
                                      }
                                      onClick={() => setAdjustmentType("add")}
                                    >
                                      เพิ่ม
                                    </Button>
                                    <Button
                                      variant={
                                        adjustmentType === "remove"
                                          ? "default"
                                          : "outline"
                                      }
                                      className={
                                        adjustmentType === "remove"
                                          ? "bg-red-600 hover:bg-red-700"
                                          : ""
                                      }
                                      onClick={() =>
                                        setAdjustmentType("remove")
                                      }
                                    >
                                      ลด
                                    </Button>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="quantity">
                                      จำนวน (
                                      {getIngredientUnit(stock.ingredientId)})
                                    </Label>
                                    <Input
                                      id="quantity"
                                      type="number"
                                      min="1"
                                      value={adjustmentQuantity}
                                      onChange={(e) =>
                                        setAdjustmentQuantity(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    onClick={handleAdjustStock}
                                  >
                                    บันทึก
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setEditingIngredient(ingredient);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>แก้ไขวัตถุดิบ</DialogTitle>
                                  <DialogDescription>
                                    แก้ไขรายละเอียดวัตถุดิบ
                                  </DialogDescription>
                                </DialogHeader>
                                {editingIngredient && (
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-name">
                                        ชื่อวัตถุดิบ
                                      </Label>
                                      <Input
                                        id="edit-name"
                                        value={editingIngredient.name}
                                        onChange={(e) =>
                                          setEditingIngredient({
                                            ...editingIngredient,
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-unit">หน่วย</Label>
                                      <Input
                                        id="edit-unit"
                                        value={editingIngredient.unit}
                                        onChange={(e) =>
                                          setEditingIngredient({
                                            ...editingIngredient,
                                            unit: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    onClick={handleUpdateIngredient}
                                  >
                                    บันทึก
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleDeleteIngredient(ingredient.id)
                              }
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
