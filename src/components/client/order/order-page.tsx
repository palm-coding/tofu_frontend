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
import { ShoppingCart } from "lucide-react";
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

// นำเข้าคอมโพเนนต์ย่อย
import { OrderHeader } from "./order-header";
import { OrderContent } from "./order-content";
import { OrderMenuDialog } from "./dialogs/order-menu-dialog";
import { OrderCartDialog } from "./dialogs/order-cart-dialog";

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

  const addToCart = (item: CartItem) => {
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
        return "bg-[var(--chart-4)] text-primary-foreground";
      case "preparing":
        return "bg-[var(--chart-2)] text-primary-foreground";
      case "served":
        return "bg-[var(--chart-3)] text-primary-foreground";
      default:
        return "";
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

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-muted rounded-full border-t-primary mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // User name input screen
  if (!userNameSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-card">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-light text-card-foreground">
              ยินดีต้อนรับ
            </CardTitle>
            <CardDescription>
              กรุณาระบุชื่อของคุณเพื่อเริ่มสั่งอาหาร
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name" className="text-foreground">
                ชื่อของคุณ
              </Label>
              <Input
                id="user-name"
                placeholder="กรุณาระบุชื่อ"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="border-input focus:border-ring"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
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
    <div className="min-h-screen bg-background pb-20">
      <Toaster position="top-center" richColors />

      {/* Header Component */}
      <OrderHeader
        session={session}
        userName={userName}
        cart={cart}
        setCartDialogOpen={setCartDialogOpen}
      />

      {/* Content Component */}
      <OrderContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        isTabsSticky={isTabsSticky}
        tabsRef={tabsRef}
        searchRef={searchRef}
        categoryTabsRef={categoryTabsRef}
        categories={categories}
        activeCategory={activeCategory}
        groupedMenuItems={groupedMenuItems}
        categoryRefs={categoryRefs}
        scrollToCategory={scrollToCategory}
        menuItems={menuItems}
        handleOpenItemDialog={handleOpenItemDialog}
        orderHistory={orderHistory}
        getTimeAgo={getTimeAgo}
        getStatusText={getStatusText}
        getStatusColor={getStatusColor}
      />

      {/* Menu Dialog Component */}
      <OrderMenuDialog
        selectedItem={selectedItem}
        itemDialogOpen={itemDialogOpen}
        setItemDialogOpen={setItemDialogOpen}
        itemQuantity={itemQuantity}
        setItemQuantity={setItemQuantity}
        itemNote={itemNote}
        setItemNote={setItemNote}
        handleAddItemToCart={handleAddItemToCart}
      />

      {/* Cart Dialog Component */}
      <OrderCartDialog
        cart={cart}
        cartDialogOpen={cartDialogOpen}
        setCartDialogOpen={setCartDialogOpen}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        updateCartItemNote={updateCartItemNote}
        calculateTotal={calculateTotal}
        submitOrder={submitOrder}
      />

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            size="lg"
            className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl transition-all duration-300"
            onClick={() => setCartDialogOpen(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
              {cart.length}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
