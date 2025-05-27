import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { CreateCategoriesDialog } from "../dialogs/create-categories-dialog";
import { EditCategoriesDialog } from "../dialogs/edit-categories-dialog";
import { MenuCategory, MenuItem } from "@/interfaces/menu.interface";

interface CategoriesTabProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  newCategory: string;
  setNewCategory: (category: string) => void;
  editingCategory: MenuCategory | null;
  setEditingCategory: (category: MenuCategory | null) => void;
  handleAddCategory: () => Promise<void>;
  handleUpdateCategory: () => Promise<void>;
  handleDeleteCategory: (categoryId: string) => Promise<void>;
}

export function CategoriesTab({
  categories,
  menuItems,
  newCategory,
  setNewCategory,
  editingCategory,
  setEditingCategory,
  handleAddCategory,
  handleUpdateCategory,
  handleDeleteCategory,
}: CategoriesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">หมวดหมู่ทั้งหมด</h2>

        <CreateCategoriesDialog
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          handleAddCategory={handleAddCategory}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories && categories.length > 0 ? (
          categories.map((category) => {
            const itemCount =
              menuItems?.filter((item) => item.categoryId === category._id)
                .length || 0;

            return (
              <Card key={category._id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {itemCount} รายการในหมวดหมู่นี้
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end space-x-2">
                  <EditCategoriesDialog
                    category={category}
                    editingCategory={editingCategory}
                    setEditingCategory={setEditingCategory}
                    handleUpdateCategory={handleUpdateCategory}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteCategory(category._id)}
                    disabled={itemCount > 0}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-3 text-center py-8 text-muted-foreground">
            ไม่พบหมวดหมู่
          </div>
        )}
      </div>
    </div>
  );
}
