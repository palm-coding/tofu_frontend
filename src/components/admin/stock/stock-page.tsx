"use client";

import { useEffect, useState } from "react";
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
import { AlertTriangle, Edit, Loader2, Plus, Trash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { stockService } from "@/services/stock.service";
import {
  Ingredient,
  Stock,
  CreateIngredientDto,
  AdjustStockDto,
  UpdateThresholdDto,
} from "@/interfaces/stock.interface";
import { Branch } from "@/interfaces/branch.interface";

interface StockManagementProps {
  branchCode: string; // The URL-friendly code (e.g., "hatyai")
  branchId?: string; // The MongoDB _id (optional if not available yet)
  branch?: Branch | null; // The full branch object (optional)
}

export function StockDisplay({ branchId }: StockManagementProps) {
  console.log("[Stock] branchId:", branchId);
  // State
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newIngredient, setNewIngredient] = useState<CreateIngredientDto>({
    name: "",
    unit: "",
  });
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  const [adjustingStock, setAdjustingStock] = useState<Stock | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");

  const [editingThreshold, setEditingThreshold] = useState<Stock | null>(null);
  const [newThreshold, setNewThreshold] = useState<string>("");

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (!branchId) {
          setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
          return;
        }
        setError(null);

        // Fetch ingredients and stocks data
        const [ingredientsResponse, stocksResponse] = await Promise.all([
          stockService.getIngredients(),
          stockService.getStocks(branchId),
        ]);

        setIngredients(ingredientsResponse.ingredients);
        setStocks(stocksResponse.stocks);
      } catch (err) {
        console.error("Error loading stock data:", err);
        setError("ไม่สามารถโหลดข้อมูลสต็อกได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [branchId]);

  // Ingredient functions
  const handleAddIngredient = async () => {
    if (!newIngredient.name.trim() || !newIngredient.unit.trim()) return;

    try {
      // Add new ingredient
      const response = await stockService.addIngredient(newIngredient);
      setIngredients([...ingredients, response.ingredient]);

      if (!branchId) {
        setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
        return;
      }

      // Create initial stock for this ingredient
      const stockResponse = await stockService.createStock(
        branchId,
        response.ingredient.id
      );
      setStocks([...stocks, stockResponse.stock]);

      // Reset form
      setNewIngredient({ name: "", unit: "" });
    } catch (err) {
      console.error("Failed to add ingredient:", err);
      setError("ไม่สามารถเพิ่มวัตถุดิบได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleUpdateIngredient = async () => {
    if (
      !editingIngredient ||
      !editingIngredient.name.trim() ||
      !editingIngredient.unit.trim()
    )
      return;

    try {
      const response = await stockService.updateIngredient(
        editingIngredient.id,
        {
          name: editingIngredient.name,
          unit: editingIngredient.unit,
        }
      );

      const updatedIngredients = ingredients.map((ing) =>
        ing.id === editingIngredient.id ? response.ingredient : ing
      );

      setIngredients(updatedIngredients);
      setEditingIngredient(null);
    } catch (err) {
      console.error("Failed to update ingredient:", err);
      setError("ไม่สามารถแก้ไขวัตถุดิบได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    try {
      await stockService.deleteIngredient(ingredientId);

      // Update local state
      const updatedIngredients = ingredients.filter(
        (ing) => ing.id !== ingredientId
      );
      const updatedStocks = stocks.filter(
        (stock) => stock.ingredientId !== ingredientId
      );

      setIngredients(updatedIngredients);
      setStocks(updatedStocks);
    } catch (err) {
      console.error("Failed to delete ingredient:", err);
      setError("ไม่สามารถลบวัตถุดิบได้ กรุณาลองอีกครั้ง");
    }
  };

  // Stock functions
  const handleAdjustStock = async () => {
    if (
      !adjustingStock ||
      !adjustmentQuantity ||
      isNaN(Number(adjustmentQuantity)) ||
      Number(adjustmentQuantity) <= 0
    )
      return;

    try {
      const adjustmentData: AdjustStockDto = {
        quantity: Number(adjustmentQuantity),
        type: adjustmentType,
      };

      if (!branchId) {
        setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
        return;
      }

      const response = await stockService.adjustStock(
        branchId,
        adjustingStock.id,
        adjustmentData
      );

      const updatedStocks = stocks.map((stock) =>
        stock.id === adjustingStock.id ? response.stock : stock
      );

      setStocks(updatedStocks);
      setAdjustingStock(null);
      setAdjustmentQuantity("");
      setAdjustmentType("add");
    } catch (err) {
      console.error("Failed to adjust stock:", err);
      setError("ไม่สามารถปรับสต็อกได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleUpdateThreshold = async () => {
    if (
      !editingThreshold ||
      !newThreshold ||
      isNaN(Number(newThreshold)) ||
      Number(newThreshold) < 0
    )
      return;

    try {
      const thresholdData: UpdateThresholdDto = {
        lowThreshold: Number(newThreshold),
      };

      if (!branchId) {
        setError("ไม่พบข้อมูลสาขา กรุณาลองอีกครั้ง");
        return;
      }

      const response = await stockService.updateThreshold(
        branchId,
        editingThreshold.id,
        thresholdData
      );

      const updatedStocks = stocks.map((stock) =>
        stock.id === editingThreshold.id ? response.stock : stock
      );

      setStocks(updatedStocks);
      setEditingThreshold(null);
      setNewThreshold("");
    } catch (err) {
      console.error("Failed to update threshold:", err);
      setError("ไม่สามารถตั้งค่าแจ้งเตือนได้ กรุณาลองอีกครั้ง");
    }
  };

  // Helper function to get ingredient by id
  const getIngredient = (ingredientId: string): Ingredient | undefined => {
    return ingredients.find((ing) => ing.id === ingredientId);
  };

  // Get low stock items
  const lowStockItems = stocks.filter(
    (stock) => stock.quantity <= stock.lowThreshold
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>กำลังโหลดข้อมูลสต็อก...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button className="mt-2" onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
          </Button>
        </Alert>
      </div>
    );
  }

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
                    const ingredient = getIngredient(stock.ingredientId);
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
                                    ปรับสต็อก {ingredient.name}
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
                                      จำนวน ({ingredient.unit})
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
