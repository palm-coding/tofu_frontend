import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingCart, History, Coffee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import {
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
} from "@/interfaces/order.interface";
import { RefObject } from "react";

interface OrderContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  handleSearch: (query: string) => void;
  isTabsSticky: boolean;
  // แก้ไข RefObject types ให้รองรับ null
  tabsRef: RefObject<HTMLDivElement | null>;
  searchRef: RefObject<HTMLDivElement | null>;
  categoryTabsRef: RefObject<HTMLDivElement | null>;
  categories: MenuCategory[];
  activeCategory: string;
  groupedMenuItems: { [key: string]: MenuItem[] };
  categoryRefs: RefObject<{ [key: string]: HTMLDivElement | null }>;
  scrollToCategory: (categoryId: string) => void;
  menuItems: MenuItem[];
  handleOpenItemDialog: (item: MenuItem) => void;
  orderHistory: Order[];
  getTimeAgo: (dateString: string) => string;
  getStatusText: (status: OrderStatus) => string;
  getStatusColor: (status: OrderStatus) => string;
}

export function OrderContent({
  activeTab,
  setActiveTab,
  searchQuery,
  handleSearch,
  isTabsSticky,
  tabsRef,
  searchRef,
  categoryTabsRef,
  categories,
  activeCategory,
  groupedMenuItems,
  categoryRefs,
  scrollToCategory,
  menuItems,
  handleOpenItemDialog,
  orderHistory,
  getTimeAgo,
  getStatusText,
  getStatusColor,
}: OrderContentProps) {
  return (
    <main className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full bg-muted border-0">
          <TabsTrigger
            value="menu"
            className="flex-1 data-[state=active]:bg-background dark:data-[state=active]:bg-card"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            เมนู
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 data-[state=active]:bg-background dark:data-[state=active]:bg-card"
          >
            <History className="h-4 w-4 mr-2" />
            ประวัติการสั่ง
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="mt-6">
          {/* Search Bar */}
          <div ref={searchRef} className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเมนู..."
              className="pl-10 border-input focus:border-ring"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Sticky Category Tabs */}
          <div
            ref={tabsRef}
            className={`${
              isTabsSticky
                ? "fixed top-[73px] left-0 right-0 z-20 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm"
                : "relative"
            } transition-all duration-300`}
          >
            <div className="container mx-auto px-4 py-3">
              <div
                className="flex space-x-1 bg-muted rounded-lg p-1 overflow-x-auto"
                ref={categoryTabsRef}
              >
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = activeCategory === category.id;
                  const itemCount = groupedMenuItems[category.id]?.length || 0;

                  return (
                    <button
                      key={category.id}
                      data-category={category.id}
                      onClick={() => scrollToCategory(category.id)}
                      className={`
                        relative flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                        ${
                          isActive
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        }
                      `}
                    >
                      {isActive && (
                        <div className="w-full absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                      )}
                      <IconComponent className="mr-2 h-4 w-4" />
                      {category.name}
                      {itemCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 h-5 px-1.5 text-xs bg-muted-foreground/20 text-foreground"
                        >
                          {itemCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu Items by Category */}
          <div className={`${isTabsSticky ? "mt-16" : ""} space-y-8`}>
            {categories.map((category) => {
              const categoryItems = groupedMenuItems[category.id] || [];
              const IconComponent = category.icon;

              if (categoryItems.length === 0) return null;

              return (
                <div
                  key={category.id}
                  ref={(el) => {
                    if (categoryRefs.current) {
                      categoryRefs.current[category.id] = el;
                    }
                  }}
                  data-category-id={category.id}
                  className="scroll-mt-32"
                >
                  {/* Category Header */}
                  <div className="flex items-center mb-6 pb-3 border-b border-border">
                    <IconComponent className="h-6 w-6 text-muted-foreground mr-3" />
                    <h2 className="text-2xl font-semibold text-foreground">
                      {category.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="ml-3 bg-muted text-foreground"
                    >
                      {categoryItems.length} รายการ
                    </Badge>
                  </div>

                  {/* Category Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryItems.map((item) => (
                      <Card
                        key={item.id}
                        className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-card animate-fade-in"
                        onClick={() => handleOpenItemDialog(item)}
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-light text-card-foreground">
                              {item.name}
                            </CardTitle>
                            <span className="font-semibold text-card-foreground">
                              ฿{item.price}
                            </span>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-0">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            เพิ่มลงตะกร้า
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* No Results */}
            {menuItems.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <Coffee className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  ไม่พบเมนูที่ค้นหา
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <h2 className="text-2xl font-light mb-6 text-foreground">
            ประวัติการสั่งอาหาร
          </h2>

          {orderHistory.length === 0 ? (
            <Card className="bg-card border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <History className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  ยังไม่มีประวัติการสั่งอาหาร
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order) => (
                <Card key={order.id} className="bg-card border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-light text-card-foreground">
                        ออร์เดอร์ {getTimeAgo(order.createdAt)}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`border-0 font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <CardDescription>สั่งโดย: {order.userName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start"
                        >
                          <div>
                            <span className="font-medium text-card-foreground">
                              {item.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              x{item.quantity}
                            </span>
                            {item.note && (
                              <p className="text-xs text-muted-foreground mt-1">
                                หมายเหตุ: {item.note}
                              </p>
                            )}
                          </div>
                          <span className="font-medium text-card-foreground">
                            ฿{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-card-foreground">รวมทั้งสิ้น</span>
                      <span className="text-card-foreground">
                        ฿{order.total}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
