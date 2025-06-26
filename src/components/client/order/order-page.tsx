"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import {
  ShoppingCart,
  Coffee,
  Utensils,
  IceCream,
  Soup,
  Coffee as CoffeeIcon,
  Cookie,
  LucideIcon,
  History,
} from "lucide-react";
import { toast } from "sonner";

// แก้ไขการ import service ให้ถูกต้อง
import { orderService } from "@/services/order/order.service";
import { sessionService } from "@/services/session/session.service";
import { menuService } from "@/services/menu.service";

// import websocket
import { useOrdersSocket } from "@/hooks/useOrdersSocket";

// เพิ่มการนำเข้า interfaces ที่จำเป็น
import { Order, OrderStatus } from "@/interfaces/order.interface";
import { MenuItem, MenuCategory } from "@/interfaces/menu.interface";
import { Session, BranchData, TableData } from "@/interfaces/session.interface";
import { CartItem } from "@/interfaces/cart.interface"; // นำเข้า CartItem จาก interfaces ใหม่

// นำเข้าคอมโพเนนต์ย่อย
import { OrderHeader } from "./order-header";
import { OrderContent } from "./order-content";
import { OrderMenuDialog } from "./dialogs/order-menu-dialog";
import { OrderCartDialog } from "./dialogs/order-cart-dialog";
import { SessionCheckoutEvent } from "@/interfaces/websocket.interface";

const getCategoryWithIcon = (
  categories: MenuCategory[]
): (MenuCategory & { icon: LucideIcon })[] => {
  if (!Array.isArray(categories)) return [];

  return categories.map((category) => {
    let icon: LucideIcon;
    // กำหนดไอคอนตามชื่อหมวดหมู่
    if (category.name.includes("ท็อปปิ้ง")) {
      icon = Cookie;
    } else if (category.name.includes("ของหวาน")) {
      icon = IceCream;
    } else if (category.name.includes("เครื่องดื่มร้อน")) {
      icon = Coffee;
    } else if (category.name.includes("เครื่องดื่มเย็น")) {
      icon = CoffeeIcon;
    } else if (category.name.includes("ปาท่องโก๋")) {
      icon = Utensils;
    } else {
      // ไอคอนเริ่มต้น
      icon = Soup;
    }

    return { ...category, icon };
  });
};

interface OrderPageProps {
  qrCode: string;
}

export function OrderDisplay({ qrCode }: OrderPageProps) {
  console.log("OrderDisplay rendered with qrCode:", qrCode);
  // State with proper TypeScript typing
  const [sessionId, setSessionId] = useState<string>("");
  const [session, setSession] = useState<Session | null>(null);
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
  const [clientId, setClientId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Refs for scroll detection
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryTabsRef = useRef<HTMLDivElement>(null);

  // เพิ่ม handler สำหรับ session checkout
  const handleSessionCheckout = useCallback(
    (checkoutEvent: SessionCheckoutEvent) => {
      console.log(
        "Session checkout received:",
        JSON.stringify(checkoutEvent, null, 2)
      );

      // ตรวจสอบว่าเป็น session ที่กำลังใช้งานอยู่หรือไม่
      if (checkoutEvent._id === sessionId) {
        toast.info("เซสชันสิ้นสุดลงแล้ว", {
          description: "โต๊ะนี้ได้ถูกเช็คเอาท์แล้ว กรุณาชำระเงินที่เคาน์เตอร์",
          duration: 0, // ไม่หายไปโดยอัตโนมัติ
        });

        // อัพเดต UI เพื่อแสดงว่าเซสชันถูก checkout แล้ว
        setSession((prevSession) =>
          prevSession
            ? { ...prevSession, checkoutAt: checkoutEvent.checkoutAt }
            : null
        );

        // ตรวจสอบและอัปเดตประวัติออร์เดอร์จาก orderIds ที่อยู่ใน session checkout
        if (
          Array.isArray(checkoutEvent.orderIds) &&
          checkoutEvent.orderIds.length > 0
        ) {
          // กรณีที่ orderIds เป็น array ของ object orders
          if (
            typeof checkoutEvent.orderIds[0] === "object" &&
            checkoutEvent.orderIds[0] &&
            "_id" in checkoutEvent.orderIds[0]
          ) {
            // ใช้ as unknown ก่อนแล้วค่อย as Order[] เพื่อหลีกเลี่ยงข้อผิดพลาด TypeScript
            setOrderHistory(checkoutEvent.orderIds as unknown as Order[]);
            console.log("Updated order history from session checkout event");
          }
          // กรณีที่ orderIds เป็น array ของ string ids แต่ไม่มีข้อมูลใน orderHistory
          else if (orderHistory.length === 0) {
            // ถ้าไม่มีประวัติออร์เดอร์ ให้ดึงข้อมูลออร์เดอร์จาก API
            const fetchOrders = async () => {
              try {
                const historyResponse = await orderService.getOrdersForSession(
                  checkoutEvent._id
                );
                if (
                  Array.isArray(historyResponse) &&
                  historyResponse.length > 0
                ) {
                  setOrderHistory(historyResponse);
                  console.log("Fetched order history after session checkout");
                }
              } catch (error) {
                console.error(
                  "Failed to fetch orders after session checkout:",
                  error
                );
              }
            };
            fetchOrders();
          }
        }
      }
    },
    [sessionId, orderHistory]
  );

  // เพิ่มการใช้งาน websocket hook
  const { isConnected } = useOrdersSocket({
    sessionId,
    onSessionCheckout: handleSessionCheckout,
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
  });

  useEffect(() => {
    console.log(
      "WebSocket connection status:",
      isConnected ? "Connected" : "Disconnected"
    );
  }, [isConnected]);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        if (!qrCode) {
          toast.error("ไม่พบรหัส QR Code");
          setLoading(false);
          return;
        }

        console.log("กำลังดึงข้อมูล session สำหรับ QR Code:", qrCode);

        // ดึงข้อมูล session โดยใช้ QR Code
        let sessionsResponse;
        try {
          sessionsResponse = await sessionService.getSessionsForQrCode(qrCode);
          console.log(
            "Sessions response:",
            JSON.stringify(sessionsResponse, null, 2)
          );
        } catch (err) {
          console.error("Error fetching session:", err);
          toast.error("ไม่สามารถดึงข้อมูลเซสชันได้");
          setLoading(false);
          return;
        }

        // ตรวจสอบว่ามี session หรือไม่
        if (!sessionsResponse || sessionsResponse.length === 0) {
          toast.error("ไม่พบข้อมูลโต๊ะ กรุณาตรวจสอบ QR Code");
          setLoading(false);
          return;
        }

        // ใช้ session แรกที่ได้
        const currentSession = sessionsResponse[0];
        console.log("Using session:", currentSession);

        // ตรวจสอบความถูกต้องของ session object
        if (!currentSession || !currentSession._id) {
          toast.error("รูปแบบข้อมูล session ไม่ถูกต้อง");
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setSessionId(currentSession._id);

        // ดึง branchId จาก session โดยรองรับทั้งกรณีที่เป็น object และ string
        const branchId = getBranchIdFromSession(currentSession);
        console.log("Using branchId:", branchId);

        if (!branchId) {
          toast.error("ไม่พบข้อมูลสาขา");
          setLoading(false);
          return;
        }

        // ดึงข้อมูล categories
        try {
          const categoriesResponse = await menuService.getCategories(branchId);
          console.log("Categories response:", categoriesResponse);

          // แก้ไขการตรวจสอบรูปแบบข้อมูล
          if (Array.isArray(categoriesResponse)) {
            // กรณีที่ API ส่งคืนเป็น array โดยตรง
            setCategories(categoriesResponse);

            if (categoriesResponse.length > 0) {
              setActiveCategory(categoriesResponse[0]._id);
            }
          } else if (
            categoriesResponse &&
            categoriesResponse.categories &&
            Array.isArray(categoriesResponse.categories)
          ) {
            // กรณีที่ API ส่งคืนเป็น { categories: [...] }
            setCategories(categoriesResponse.categories);

            if (categoriesResponse.categories.length > 0) {
              setActiveCategory(categoriesResponse.categories[0]._id);
            }
          } else {
            console.warn("Invalid categories response format");
            setCategories([]);
          }
        } catch (categoryError) {
          console.error("Error fetching categories:", categoryError);
          setCategories([]);
        }

        // ดึงข้อมูล menu items
        try {
          const menuItemsResponse = await menuService.getMenuItems(branchId);
          console.log("Menu items response:", menuItemsResponse);

          // แก้ไขการตรวจสอบรูปแบบข้อมูล
          if (Array.isArray(menuItemsResponse)) {
            // กรณีที่ API ส่งคืนเป็น array โดยตรง
            setMenuItems(menuItemsResponse);
          } else if (
            menuItemsResponse &&
            menuItemsResponse.items &&
            Array.isArray(menuItemsResponse.items)
          ) {
            // กรณีที่ API ส่งคืนเป็น { items: [...] }
            setMenuItems(menuItemsResponse.items);
          } else {
            console.warn("Invalid menu items response format");
            setMenuItems([]);
          }
        } catch (menuError) {
          console.error("Error fetching menu items:", menuError);
          setMenuItems([]);
        }

        // ดึงข้อมูล orders ของ session
        try {
          const historyResponse = await orderService.getOrdersForSession(
            currentSession._id
          );
          console.log("Order history response:", historyResponse);
          setOrderHistory(
            Array.isArray(historyResponse) ? historyResponse : []
          );
        } catch (orderError) {
          console.error("Error fetching order history:", orderError);
          setOrderHistory([]);
        }

        // ตรวจสอบข้อมูลใน localStorage
        const storedUserName = localStorage.getItem(`userName_${qrCode}`);
        if (storedUserName) {
          setUserName(storedUserName);
          setUserNameSubmitted(true);
        }

        // ตรวจสอบ clientId ที่เคยบันทึกไว้
        const storedClientId = localStorage.getItem(`clientId_${qrCode}`);
        if (storedClientId) {
          setClientId(storedClientId);
        }

        const storedCart = localStorage.getItem(`cart_${qrCode}`);
        if (storedCart) {
          try {
            const parsedCart = JSON.parse(storedCart);
            if (Array.isArray(parsedCart)) {
              setCart(parsedCart);
            }
          } catch (error) {
            console.error("Error parsing cart from localStorage:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [qrCode]);
  
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (activeTab === "history" && sessionId) {
        try {
          console.log("กำลังโหลดประวัติการสั่งเนื่องจากเปลี่ยนแท็บ");
          const historyResponse = await orderService.getOrdersForSession(
            sessionId
          );
          if (Array.isArray(historyResponse)) {
            setOrderHistory(historyResponse);
            console.log(
              "อัพเดทประวัติการสั่งเรียบร้อย จำนวน:",
              historyResponse.length
            );
          }
        } catch (error) {
          console.error("ไม่สามารถโหลดประวัติการสั่งได้:", error);
          toast.error("ไม่สามารถโหลดประวัติการสั่งได้", {
            description: "กรุณาลองอีกครั้งภายหลัง",
          });
        }
      }
    };

    fetchOrderHistory();
  }, [activeTab, sessionId]);
  // Helper function to get branchId from session - ระบุ Type ที่ชัดเจน
  const getBranchIdFromSession = (
    sessionData: Session | Record<string, unknown>
  ): string => {
    if (!sessionData || !sessionData.branchId) return "";

    if (typeof sessionData.branchId === "string") {
      return sessionData.branchId;
    }

    if (
      typeof sessionData.branchId === "object" &&
      "branchId" in sessionData &&
      "_id" in (sessionData.branchId as BranchData)
    ) {
      return (sessionData.branchId as BranchData)._id;
    }

    return "";
  };

  // Helper function to get tableId from session - ระบุ Type ที่ชัดเจน
  const getTableIdFromSession = (
    sessionData: Session | Record<string, unknown>
  ): string => {
    if (!sessionData || !sessionData.tableId) return "";

    if (typeof sessionData.tableId === "string") {
      return sessionData.tableId;
    }

    if (
      typeof sessionData.tableId === "object" &&
      "tableId" in sessionData &&
      "_id" in (sessionData.tableId as TableData)
    ) {
      return (sessionData.tableId as TableData)._id;
    }

    return "";
  };

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

      if (
        categoryElements.length === 0 ||
        !Array.isArray(categories) ||
        categories.length === 0
      )
        return;

      let currentCategory = categories[0]._id;

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
    if (!Array.isArray(categories) || categories.length === 0) return;

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

  // แก้ไขฟังก์ชัน handleSubmitUserName เพื่อเรียกใช้ joinSession
  const handleSubmitUserName = async () => {
    if (!userName.trim()) return;

    try {
      // สร้าง clientId สำหรับลูกค้าคนนี้
      const newClientId = `device_${Date.now()}`;
      setClientId(newClientId);

      // บันทึกข้อมูลลงใน localStorage
      localStorage.setItem(`clientId_${qrCode}`, newClientId);
      localStorage.setItem(`userName_${qrCode}`, userName);

      // เรียกใช้ sessionService.joinSession เพื่อเข้าร่วมเซสชั่น
      if (qrCode) {
        try {
          const joinData = {
            clientId: newClientId,
            userLabel: userName,
          };

          console.log(`กำลังเข้าร่วมเซสชั่นด้วย QR Code: ${qrCode}`, joinData);

          const response = await sessionService.joinSession(qrCode, joinData);
          console.log(
            "เข้าร่วมเซสชั่นสำเร็จ:",
            JSON.stringify(response, null, 2)
          );

          toast.success("เข้าร่วมโต๊ะสำเร็จ", {
            description: `ยินดีต้อนรับคุณ ${userName}`,
          });

          // อัพเดต session หลังจากเข้าร่วม
          if (response) {
            setSession(response);
          }
        } catch (error) {
          console.error("ไม่สามารถเข้าร่วมเซสชั่นได้:", error);
          toast.error("พบปัญหาในการเข้าร่วมโต๊ะ", {
            description: "แต่คุณยังสามารถสั่งอาหารได้",
          });
        }
      }

      // ตั้งค่าให้ผ่านหน้าเข้าสู่ระบบไปยังหน้าสั่งอาหาร
      setUserNameSubmitted(true);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลงทะเบียน:", error);

      // บันทึกชื่อใน localStorage และยังคงให้ผู้ใช้สั่งอาหารได้แม้จะมีข้อผิดพลาด
      localStorage.setItem(`userName_${qrCode}`, userName);
      setUserNameSubmitted(true);

      toast.error("พบข้อผิดพลาด", {
        description: "แต่คุณยังสามารถสั่งอาหารได้",
      });
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
      (cartItem) => cartItem._id === selectedItem._id
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
    localStorage.setItem(`cart_${qrCode}`, JSON.stringify(newCart));
    setItemDialogOpen(false);

    toast(`${selectedItem.name} x${itemQuantity}`, {
      description: "เพิ่มลงตะกร้าแล้ว",
    });
  };

  const addToCart = (item: CartItem) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem._id === item._id
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
    localStorage.setItem(`cart_${qrCode}`, JSON.stringify(newCart));
  };

  const removeFromCart = (itemId: string) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem._id === itemId
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
      localStorage.setItem(`cart_${qrCode}`, JSON.stringify(newCart));
    }
  };

  const updateCartItemNote = (itemId: string, note: string) => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem._id === itemId
    );

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        note,
      };

      setCart(newCart);
      localStorage.setItem(`cart_${qrCode}`, JSON.stringify(newCart));
    }
  };

  // แก้ไขฟังก์ชัน submitOrder เพื่อใช้ฟังก์ชัน helper สำหรับดึง ID
  const submitOrder = async () => {
    if (cart.length === 0) return;

    try {
      setIsSubmitting(true);
      // แปลงข้อมูลจาก cart เป็น orderLines
      const orderLines = cart.map((item) => ({
        menuItemId: item._id,
        qty: item.quantity,
        note: item.note,
      }));

      // ใช้ฟังก์ชัน helper เพื่อดึง branchId และ tableId
      const branchId = session ? getBranchIdFromSession(session) : "";
      const tableId = session ? getTableIdFromSession(session) : "";

      // สร้าง request object ตามที่ API ต้องการ
      const orderRequest = {
        sessionId,
        branchId,
        tableId,
        clientId: clientId || "",
        orderBy: userName,
        orderLines,
        totalAmount: calculateTotal(),
      };

      console.log("กำลังส่งคำสั่งซื้อ:", orderRequest);

      // แก้ไขจาก orderService.submitOrder เป็น orderService.createOrder
      const response = await orderService.createOrder(orderRequest);

      // Update order history
      if (response && response.order) {
        setOrderHistory([response.order, ...orderHistory]);
      }

      // Clear cart
      setCart([]);
      localStorage.setItem(`cart_${qrCode}`, JSON.stringify([]));

      // Close cart dialog
      setCartDialogOpen(false);

      // Show toast notification
      toast.success("สั่งอาหารเรียบร้อย", {
        description: "ระบบได้รับออร์เดอร์ของคุณแล้ว",
      });
    } catch (error) {
      console.error("Failed to submit order:", error);
      toast.error("เกิดข้อผิดพลาดในการสั่งอาหาร กรุณาลองอีกครั้ง");
    } finally {
      // รีเซ็ตสถานะการส่งคำสั่ง ไม่ว่าจะสำเร็จหรือไม่ก็ตาม
      setIsSubmitting(false);
    }
  };

  const calculateTotal = (): number => {
    if (!Array.isArray(cart) || cart.length === 0) return 0;
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "เมื่อสักครู่";
      if (diffMins === 1) return "1 นาทีที่แล้ว";
      return `${diffMins} นาทีที่แล้ว`;
    } catch (error) {
      console.error("Error calculating time ago:", error);
      return "ไม่ทราบเวลา";
    }
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "รอรับออร์เดอร์";
      case "preparing":
        return "กำลังทำ";
      case "served":
        return "เสิร์ฟแล้ว";
      case "paid":
        return "ชำระเงินแล้ว";
      default:
        return status || "ไม่ทราบสถานะ";
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
      case "paid":
        return "bg-[var(--chart-1)] text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    try {
      // แก้ไขจาก orderService.searchMenuItems เป็นการกรองข้อมูลเอง
      if (!query.trim()) {
        // ถ้าค้นหาว่างเปล่า ดึงข้อมูลทั้งหมดอีกครั้ง
        if (session) {
          const branchId = getBranchIdFromSession(session);
          if (branchId) {
            try {
              const menuItemsResponse = await menuService.getMenuItems(
                branchId
              );
              if (menuItemsResponse && menuItemsResponse.items) {
                setMenuItems(menuItemsResponse.items);
              }
            } catch (error) {
              console.error("Error fetching menu items:", error);
            }
          }
        }
      } else {
        // ถ้ามีคำค้นหา กรองจากข้อมูลที่มีอยู่
        if (Array.isArray(menuItems)) {
          const filteredItems = menuItems.filter(
            (item) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              (item.description &&
                item.description.toLowerCase().includes(query.toLowerCase()))
          );
          setMenuItems(filteredItems);
        }
      }
    } catch (error) {
      console.error("Failed to search menu items:", error);
    }
  };

  // Group items by category - แก้ไขเพื่อรองรับกรณี categories หรือ menuItems เป็นค่าว่าง
  const groupedMenuItems =
    Array.isArray(categories) && categories.length > 0
      ? categories.reduce((acc, category) => {
          acc[category._id] = Array.isArray(menuItems)
            ? menuItems.filter((item) => item.categoryId === category._id)
            : [];
          return acc;
        }, {} as { [key: string]: MenuItem[] })
      : {};

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

  // เช็คว่า session ถูก checkout แล้วหรือไม่
  const isCheckedOut = session?.checkoutAt;

  // แสดงแบนเนอร์แจ้งเตือนเมื่อ session ถูก checkout แล้ว
  if (isCheckedOut) {
    return (
      <div className="container px-4 mx-auto min-h-screen bg-background pt-8">
        <div className="p-6 bg-muted border border-border rounded-lg text-center">
          <h2 className="text-2xl font-medium mb-2">เซสชันสิ้นสุดแล้ว</h2>
          <p className="text-muted-foreground mb-6">
            โต๊ะนี้ได้ถูกเช็คเอาท์แล้ว กรุณาชำระเงินที่เคาน์เตอร์
          </p>
          <div className="bg-background p-4 rounded-md">
            <h3 className="font-medium text-xl mb-4">ประวัติออร์เดอร์</h3>
            {orderHistory.length > 0 ? (
              <div className="space-y-6">
                {orderHistory.map((order) => (
                  <div
                    key={order._id}
                    className="bg-card p-4 rounded-lg border border-border shadow-sm"
                  >
                    <div className="flex justify-between items-center border-b border-border pb-3 mb-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-left text-lg">
                          ออร์เดอร์โดย: {order.orderBy}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          เวลา:{" "}
                          {new Date(order.createdAt).toLocaleTimeString(
                            "th-TH",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {order.status === "served"
                          ? "เสิร์ฟแล้ว"
                          : order.status}
                      </div>
                    </div>

                    <div className="text-left mb-3">
                      <h4 className="font-medium mb-2">รายการอาหาร:</h4>
                      <ul className="space-y-2 pl-2">
                        {order.orderLines.map((line, idx) => (
                          <li key={idx} className="flex justify-between">
                            <div className="flex items-start">
                              <span className="bg-secondary text-secondary-foreground w-6 h-6 flex items-center justify-center rounded-full mr-2">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-medium">
                                  {typeof line.menuItemId === "object" &&
                                  line.menuItemId?.name
                                    ? line.menuItemId.name
                                    : `รายการที่ ${idx + 1}`}
                                </div>
                                {line.note && (
                                  <div className="text-sm text-muted-foreground">
                                    หมายเหตุ: {line.note}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">
                                {line.qty || line.quantity || 1} ×
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-border pt-3 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {order.orderLines.length} รายการ
                      </div>
                      <div className="text-lg font-semibold">
                        ยอดรวม: ฿{order.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-right">
                    <div className="text-muted-foreground mb-1">
                      ยอดรวมทั้งหมด
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ฿
                      {orderHistory
                        .reduce((sum, order) => sum + order.totalAmount, 0)
                        .toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground mb-2"
                >
                  <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                  <path d="M8 6h8"></path>
                  <path d="M8 10h8"></path>
                  <path d="M8 14h4"></path>
                </svg>
                <p className="text-muted-foreground">ไม่พบประวัติออร์เดอร์</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
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
    <div className="container px-4 mx-auto min-h-screen bg-background">
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
        categories={getCategoryWithIcon(categories)}
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
        isSubmitting={isSubmitting}
      />

      {/* Floating History Button */}
      {Array.isArray(orderHistory) &&
        orderHistory.length > 0 &&
        activeTab !== "history" && (
          <div className="fixed bottom-6 left-6 md:hidden">
            <Button
              size="lg"
              className="rounded-full h-16 w-16 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-2xl transition-all duration-300"
              onClick={() => setActiveTab("history")}
            >
              <History className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">
                {orderHistory.length}
              </span>
            </Button>
          </div>
        )}

      {/* Floating Cart Button */}
      {Array.isArray(cart) && cart.length > 0 && (
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
