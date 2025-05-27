import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash } from "lucide-react";
import Image from "next/image";
import { CreateMenuDialog } from "../dialogs/create-menu-dialog";
import { EditMenuDialog } from "../dialogs/edit-menu-dialog";
import {
  MenuCategory,
  MenuItem,
  NewMenuItemDto,
} from "@/interfaces/menu.interface";

interface MenuTabProps {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  newMenuItem: NewMenuItemDto;
  setNewMenuItem: (item: NewMenuItemDto) => void;
  editingMenuItem: MenuItem | null;
  setEditingMenuItem: (item: MenuItem | null) => void;
  handleAddMenuItem: () => Promise<void>;
  handleUpdateMenuItem: () => Promise<void>;
  handleDeleteMenuItem: (itemId: string) => Promise<void>;
  handleToggleAvailability: (itemId: string) => Promise<void>;
}

export function MenuTab({
  menuItems,
  categories,
  newMenuItem,
  setNewMenuItem,
  editingMenuItem,
  setEditingMenuItem,
  handleAddMenuItem,
  handleUpdateMenuItem,
  handleDeleteMenuItem,
  handleToggleAvailability,
}: MenuTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">รายการเมนูทั้งหมด</h2>

        <CreateMenuDialog
          newMenuItem={newMenuItem}
          setNewMenuItem={setNewMenuItem}
          handleAddMenuItem={handleAddMenuItem}
          categories={categories}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems && menuItems.length > 0 ? (
          menuItems.map((item) => (
            <Card
              key={item._id}
              className={!item.isAvailable ? "opacity-60" : ""}
            >
              <div className="relative w-full h-60">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-fill rounded-t-lg"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>
                      {categories &&
                        categories.find((cat) => cat._id === item.categoryId)
                          ?.name}
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
                    id={`available-${item._id}`}
                    checked={item.isAvailable}
                    onCheckedChange={() => handleToggleAvailability(item._id)}
                  />
                  <Label htmlFor={`available-${item._id}`} className="text-sm">
                    {item.isAvailable ? "พร้อมขาย" : "ไม่พร้อมขาย"}
                  </Label>
                </div>
                <div className="flex space-x-2">
                  <EditMenuDialog
                    item={item}
                    editingMenuItem={editingMenuItem}
                    setEditingMenuItem={setEditingMenuItem}
                    handleUpdateMenuItem={handleUpdateMenuItem}
                    categories={categories}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteMenuItem(item._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-4 text-center py-8 text-muted-foreground">
            ไม่พบรายการเมนู
          </div>
        )}
      </div>
    </div>
  );
}
