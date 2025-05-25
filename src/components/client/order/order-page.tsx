"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MinusCircle,
  PlusCircle,
  ShoppingCart,
  Store,
  X,
  Check,
  History,
  Search,
  Coffee,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { orderService } from "@/services/order.service";
import {
  CartItem,
  MenuItem,
  MenuCategory,
  Order,
  OrderStatus,
  SessionData,
  SubmitOrderRequest,
} from "@/interfaces/order.interface";

interface OrderPageProps {
  sessionId: string;
}

export function OrderDisplay({ sessionId }: OrderPageProps) {
  // State with proper TypeScript typing
  const [session, setSession] = useState<SessionData | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userNameSubmitted, setUserNameSubmitted] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cartDialogOpen, setCartDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("menu");
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemDialogOpen, setItemDialogOpen] = useState<boolean>(false);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemNote, setItemNote] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTabsSticky, setIsTabsSticky] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Refs for scroll detection
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryTabsRef = useRef<HTMLDivElement>(null);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Fetch session data
        const sessionResponse = await orderService.getSession(sessionId);
        setSession(sessionResponse.session);

        // Fetch menu categories
        const categoriesResponse = await orderService.getMenuCategories();
        setCategories(categoriesResponse.categories);

        if (categoriesResponse.categories.length > 0) {
          setActiveCategory(categoriesResponse.categories[0].id);
        }

        // Fetch menu items
        const menuItemsResponse = await orderService.getMenuItems();
        setMenuItems(menuItemsResponse.items);

        // Fetch order history
        const historyResponse = await orderService.getOrderHistory(sessionId);
        setOrderHistory(historyResponse.orders);

        // Check local storage for user details and cart
        const storedUserName = localStorage.getItem(`userName_${sessionId}`);
        if (storedUserName) {
          setUserName(storedUserName);
          setUserNameSubmitted(true);
        }

        const storedCart = localStorage.getItem(`cart_${sessionId}`);
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [sessionId]);

  // Scroll detection for sticky tabs and active category
  useEffect(() => {
    const handleScroll = () => {
      // Check if tabs should be sticky
      if (searchRef.current) {
        const searchRect = searchRef.current.getBoundingClientRect();
        setIsTabsSticky(searchRect.bottom <= 0);
      }

      // Detect active category based on scroll position
      const categoryElements = Object.entries(categoryRefs.current);

      if (categoryElements.length === 0 || categories.length === 0) return;

      let currentCategory = categories[0].id;

      for (const [categoryId, element] of categoryElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the category section is in the upper half of the viewport
          if (
            rect.top <= window.innerHeight / 2 &&
            rect.bottom >= window.innerHeight / 2
          ) {
            currentCategory = categoryId;
            break;
          }
        }
      }

      setActiveCategory(currentCategory);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  // Intersection Observer for better category detection
  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const categoryId = entry.target.getAttribute("data-category-id");
            if (categoryId) {
              setActiveCategory(categoryId);
            }
          }
        });
      },
      {
        threshold: [0.1, 0.5, 0.9],
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [categories]);

  const handleSubmitUserName = () => {
    if (userName.trim()) {
      localStorage.setItem(`userName_${sessionId}`, userName);
      setUserNameSubmitted(true);
    }
  };

  const handleOpenItemDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setItemNote("");
    setItemDialogOpen(true);
  };

  const handleAddItemToCart = () => {
    if (!selectedItem || itemQuantity <= 0) return;

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === selectedItem.id
    );

    let newCart: CartItem[];

    if (existingItemIndex >= 0) {
      newCart = [...cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        quantity: newCart[existingItemIndex].quantity + itemQuantity,
        note: itemNote || newCart[existingItemIndex].note,
      };
    } else {
      const cartItem: CartItem = {
        ...selectedItem,
        quantity: itemQuantity,
        note: itemNote,
      };
      newCart = [...cart, cartItem];
    }

    setCart(newCart);
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(newCart));
    setItemDialogOpen(false);

    toast(`${selectedItem.name} x${itemQuantity}`, {
      description: "เพิ่มลงตะกร้าแล้ว",
    });
  };

  const addToCart = (item: MenuItem) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    let newCart: CartItem[];

    if (existingItemIndex >= 0) {
      newCart = [...cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        quantity: newCart[existingItemIndex].quantity + 1,
      };
    } else {
      const cartItem: CartItem = {
        ...item,
        quantity: 1,
        note: "",
      };
      newCart = [...cart, cartItem];
    }

    setCart(newCart);
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(newCart));
  };

  const removeFromCart = (itemId: string) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === itemId
    );

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      if (newCart[existingItemIndex].quantity > 1) {
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity - 1,
        };
      } else {
        newCart.splice(existingItemIndex, 1);
      }

      setCart(newCart);
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(newCart));
    }
  };

  const updateCartItemNote = (itemId: string, note: string) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === itemId
    );

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        note,
      };

      setCart(newCart);
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(newCart));
    }
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    try {
      const orderRequest: SubmitOrderRequest = {
        items: cart,
        total: calculateTotal(),
        userName,
        sessionId,
      };

      const response = await orderService.submitOrder(orderRequest);

      // Update order history
      setOrderHistory([response.order, ...orderHistory]);

      // Clear cart
      setCart([]);
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify([]));

      // Close cart dialog
      setCartDialogOpen(false);

      // Show toast notification
      toast.success("สั่งอาหารเรียบร้อย", {
        description: "ระบบได้รับออร์เดอร์ของคุณแล้ว",
      });
    } catch (error) {
      console.error("Failed to submit order:", error);
      toast.error("เกิดข้อผิดพลาดในการสั่งอาหาร กรุณาลองอีกครั้ง");
    }
  };

  const calculateTotal = (): number => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "เมื่อสักครู่";
    if (diffMins === 1) return "1 นาทีที่แล้ว";
    return `${diffMins} นาทีที่แล้ว`;
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "รอรับออร์เดอร์";
      case "preparing":
        return "กำลังทำ";
      case "served":
        return "เสิร์ฟแล้ว";
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "preparing":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "served":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "";
    }
  };

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      const headerHeight = 120;
      const tabsHeight = 60;
      const offset = headerHeight + tabsHeight + 20;

      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
    setActiveCategory(categoryId);

    // Scroll tabs to center the active category
    if (categoryTabsRef.current) {
      const activeButton = categoryTabsRef.current.querySelector(
        `[data-category="${categoryId}"]`
      ) as HTMLElement;
      if (activeButton) {
        const container = categoryTabsRef.current;
        const containerWidth = container.offsetWidth;
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;

        const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;
        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    try {
      const response = await orderService.searchMenuItems(query);
      setMenuItems(response.items);
    } catch (error) {
      console.error("Failed to search menu items:", error);
    }
  };

  // Group items by category
  const groupedMenuItems = categories.reduce((acc, category) => {
    acc[category.id] = menuItems.filter(
      (item) => item.categoryId === category.id
    );
    return acc;
  }, {} as { [key: string]: MenuItem[] });

  // Center active category in tabs
  useEffect(() => {
    if (categoryTabsRef.current && activeCategory) {
      const activeButton = categoryTabsRef.current.querySelector(
        `[data-category="${activeCategory}"]`
      ) as HTMLElement;
      if (activeButton) {
        const container = categoryTabsRef.current;
        const containerWidth = container.offsetWidth;
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;

        const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;
        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [activeCategory]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-gray-300 dark:border-gray-700 rounded-full border-t-gray-900 dark:border-t-gray-100 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // User name input screen
  if (!userNameSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white dark:bg-gray-800">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-light text-gray-900 dark:text-gray-100">
              ยินดีต้อนรับ
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              กรุณาระบุชื่อของคุณเพื่อเริ่มสั่งอาหาร
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="user-name"
                className="text-gray-700 dark:text-gray-300"
              >
                ชื่อของคุณ
              </Label>
              <Input
                id="user-name"
                placeholder="กรุณาระบุชื่อ"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-100"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-all duration-300"
              onClick={handleSubmitUserName}
              disabled={!userName.trim()}
            >
              เริ่มสั่งอาหาร
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Store className="h-6 w-6 text-gray-900 dark:text-gray-100 mr-3" />
              <div>
                <h1 className="text-lg font-light text-gray-900 dark:text-gray-100">
                  น้ำเต้าหู้พัทลุง
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {session?.branchName} - {session?.tableName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                {userName}
              </Badge>
              {cart.length > 0 && (
                <Button
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-all duration-300"
                  onClick={() => setCartDialogOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {cart.length}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full bg-gray-100 dark:bg-gray-800 border-0">
            <TabsTrigger
              value="menu"
              className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              เมนู
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <History className="h-4 w-4 mr-2" />
              ประวัติการสั่ง
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-6">
            {/* Search Bar */}
            <div ref={searchRef} className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ค้นหาเมนู..."
                className="pl-10 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-100"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Sticky Category Tabs */}
            <div
              ref={tabsRef}
              className={`${
                isTabsSticky
                  ? "fixed top-[73px] left-0 right-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm"
                  : "relative"
              } transition-all duration-300`}
            >
              <div className="container mx-auto px-4 py-3">
                <div
                  className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto"
                  ref={categoryTabsRef}
                >
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    const isActive = activeCategory === category.id;
                    const itemCount =
                      groupedMenuItems[category.id]?.length || 0;

                    return (
                      <button
                        key={category.id}
                        data-category={category.id}
                        onClick={() => scrollToCategory(category.id)}
                        className={`
                          relative flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                          ${
                            isActive
                              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50"
                          }
                        `}
                      >
                        {isActive && (
                          <div className="w-full absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gray-900 dark:bg-gray-100 rounded-full" />
                        )}
                        <IconComponent className="mr-2 h-4 w-4" />
                        {category.name}
                        {itemCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 h-5 px-1.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
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
                      categoryRefs.current[category.id] = el;
                    }}
                    data-category-id={category.id}
                    className="scroll-mt-32"
                  >
                    {/* Category Header */}
                    <div className="flex items-center mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <IconComponent className="h-6 w-6 text-gray-700 dark:text-gray-300 mr-3" />
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h2>
                      <Badge
                        variant="outline"
                        className="ml-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {categoryItems.length} รายการ
                      </Badge>
                    </div>

                    {/* Category Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryItems.map((item) => (
                        <Card
                          key={item.id}
                          className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white dark:bg-gray-800 animate-fade-in"
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
                              <CardTitle className="text-lg font-light text-gray-900 dark:text-gray-100">
                                {item.name}
                              </CardTitle>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                ฿{item.price}
                              </span>
                            </div>
                            <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-400">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-0">
                            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-all duration-300">
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
                  <Coffee className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    ไม่พบเมนูที่ค้นหา
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <h2 className="text-2xl font-light mb-6 text-gray-900 dark:text-gray-100">
              ประวัติการสั่งอาหาร
            </h2>

            {orderHistory.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <History className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    ยังไม่มีประวัติการสั่งอาหาร
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <Card
                    key={order.id}
                    className="bg-white dark:bg-gray-800 border-0 shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-light text-gray-900 dark:text-gray-100">
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
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        สั่งโดย: {order.userName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-start"
                          >
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.name}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                x{item.quantity}
                              </span>
                              {item.note && (
                                <p className="text-xs text-gray-500 mt-1">
                                  หมายเหตุ: {item.note}
                                </p>
                              )}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              ฿{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>รวมทั้งสิ้น</span>
                        <span>฿{order.total}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Item Detail Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] bg-white dark:bg-gray-900 border-0 shadow-2xl">
          {selectedItem && (
            <>
              <DialogHeader className="text-center">
                <DialogTitle className="text-2xl font-light text-gray-900 dark:text-gray-100">
                  {selectedItem.name}
                </DialogTitle>
                <DialogDescription className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  ฿{selectedItem.price}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[50vh] custom-scrollbar">
                <div className="space-y-4 px-1">
                  {/* รูปภาพ */}
                  <div className="relative h-48 w-full rounded-xl overflow-hidden">
                    <Image
                      src={selectedItem.imageUrl || "/placeholder.svg"}
                      alt={selectedItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* คำอธิบายรูปภาพ */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-center">
                    {selectedItem.description}
                  </p>

                  {/* หมายเหตุ */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="note"
                      className="text-gray-700 dark:text-gray-300 font-medium"
                    >
                      หมายเหตุ
                    </Label>
                    <Textarea
                      id="note"
                      placeholder="เช่น ไม่ใส่น้ำแข็ง, หวานน้อย, เผ็ดน้อย"
                      value={itemNote}
                      onChange={(e) => setItemNote(e.target.value)}
                      className="border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-100 rounded-lg resize-none"
                      rows={2}
                    />
                  </div>

                  {/* จำนวน */}
                  <div className="space-y-3">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium">
                      จำนวน
                    </Label>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setItemQuantity(Math.max(1, itemQuantity - 1))
                        }
                        disabled={itemQuantity <= 1}
                        className="h-8 w-8 rounded-full p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>

                      <div className="flex flex-col items-center">
                        <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                          {itemQuantity}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          จำนวน
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setItemQuantity(itemQuantity + 1)}
                        className="h-8 w-8 rounded-full p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* ราคารวม */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          ราคารวม
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          ฿{selectedItem.price * itemQuantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setItemDialogOpen(false)}
                  className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="mr-2 h-4 w-4" />
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-all duration-300 rounded-lg"
                  onClick={handleAddItemToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  เพิ่มลงตะกร้า
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={cartDialogOpen} onOpenChange={setCartDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] bg-white dark:bg-gray-900 border-0 shadow-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-light text-gray-900 dark:text-gray-100">
              รายการสั่งซื้อ
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              รายการอาหารที่คุณเลือก ({cart.length} รายการ)
            </DialogDescription>
          </DialogHeader>

          {cart.length > 0 ? (
            <>
              <ScrollArea className="max-h-[50vh] custom-scrollbar">
                <div className="space-y-4 pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ฿{item.price} × {item.quantity} = ฿
                            {item.price * item.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls in Cart */}
                      <div className="flex items-center justify-center space-x-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium text-lg">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900"
                          onClick={() => addToCart(item)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>

                      <Input
                        placeholder="หมายเหตุ เช่น ไม่ใส่น้ำแข็ง, หวานน้อย"
                        value={item.note}
                        onChange={(e) =>
                          updateCartItemNote(item.id, e.target.value)
                        }
                        className="text-sm border-2 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-100 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center font-semibold text-xl">
                  <span>รวมทั้งสิ้น</span>
                  <span className="text-2xl">฿{calculateTotal()}</span>
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCartDialogOpen(false)}
                  className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl py-3"
                >
                  <X className="mr-2 h-4 w-4" />
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-all duration-300 rounded-xl py-3"
                  onClick={submitOrder}
                >
                  <Check className="mr-2 h-4 w-4" />
                  ยืนยันการสั่ง
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-16 text-center">
              <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                ไม่มีรายการในตะกร้า
              </p>
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 transition-all duration-300 rounded-xl px-8 py-3"
                onClick={() => setCartDialogOpen(false)}
              >
                เลือกเมนู
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            size="lg"
            className="rounded-full h-16 w-16 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 shadow-2xl transition-all duration-300"
            onClick={() => setCartDialogOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
              {cart.length}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
