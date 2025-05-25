import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, QrCode, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableItem } from "@/interfaces/table.interface";

interface TableManagementProps {
  tables: TableItem[];
  handleCheckin: (tableId: string) => void;
  handleOpenDetails: (table: TableItem) => void;
  handleShowQR: (table: TableItem) => void;
  getTableCardStyle: (status: string) => string;
  getStatusBadgeStyle: (status: string) => string;
  getStatusText: (status: string) => string;
  calculateTableTotal: (table: TableItem | null) => number;
}

export function TableManagement({
  tables,
  handleCheckin,
  handleOpenDetails,
  handleShowQR,
  getTableCardStyle,
  getStatusBadgeStyle,
  getStatusText,
  calculateTableTotal,
}: TableManagementProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tables.map((table) => (
        <motion.div
          key={table.id}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="h-full"
        >
          <Card
            className={cn(
              "group cursor-pointer transition-all duration-300 hover:shadow-xl shadow-lg animate-fade-in h-full flex flex-col",
              getTableCardStyle(table.status)
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-light text-card-foreground">
                  {table.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0 font-medium",
                    getStatusBadgeStyle(table.status)
                  )}
                >
                  {getStatusText(table.status)}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{table.capacity} ที่นั่ง</span>
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-3 pt-0 flex-grow">
              {table.status === "occupied" ? (
                <div className="space-y-2">
                  <p className="text-sm text-card-foreground">
                    ลูกค้า: {table.customerName || "ไม่ระบุ"}
                  </p>
                  <p className="text-sm text-card-foreground">
                    เช็คอิน: {table.checkinTime || "ไม่ระบุ"}
                  </p>
                  {table.orders && table.orders.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        ออร์เดอร์: {table.orders.length} รายการ
                      </p>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        ยอดรวม: ฿{calculateTableTotal(table)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground italic">
                    โต๊ะว่าง
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0 mt-auto">
              {table.status === "available" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-green-300 text-green-700 hover:bg-green-600 hover:text-primary-foreground dark:border-green-600 dark:text-green-400 dark:hover:bg-green-600 dark:hover:text-white transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckin(table.id);
                  }}
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  เช็คอิน
                </Button>
              ) : (
                <div className="w-full flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-600 hover:text-primary-foreground dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(table);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    รายละเอียด
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-600 hover:text-primary-foreground dark:border-red-600 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowQR(table);
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    QR Code
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
