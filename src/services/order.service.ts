// import axios from "axios";
import {
  MenuCategoriesResponse,
  MenuCategory,
  MenuItem,
  MenuItemsResponse,
  Order,
  OrderHistoryResponse,
  SessionData,
  SessionResponse,
  SubmitOrderRequest,
  SubmitOrderResponse,
} from "@/interfaces/order.interface";
import { CupSoda, Coffee, Dessert, UtensilsCrossed } from "lucide-react";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// Mock data for menu categories
const mockCategories: MenuCategory[] = [
  { id: "cat1", name: "เครื่องดื่ม", icon: CupSoda },
  { id: "cat2", name: "ของทานเล่น", icon: Coffee },
  { id: "cat3", name: "ของหวาน", icon: Dessert },
  { id: "cat4", name: "อาหารจานหลัก", icon: UtensilsCrossed },
];

// Mock data for menu items
const mockMenuItems: MenuItem[] = [
  {
    id: "item1",
    name: "น้ำเต้าหู้ร้อน",
    description:
      "น้ำเต้าหู้ร้อนสูตรดั้งเดิม รสชาติกลมกล่อม หอมกลิ่นถั่วเหลืองแท้",
    price: 25,
    categoryId: "cat1",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item2",
    name: "น้ำเต้าหู้เย็น",
    description:
      "น้ำเต้าหู้เย็นหวานชื่นใจ เสิร์ฟพร้อมน้ำแข็ง ดับกระหายคลายร้อน",
    price: 30,
    categoryId: "cat1",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item3",
    name: "น้ำเต้าหู้ปั่น",
    description:
      "น้ำเต้าหู้ปั่นเข้มข้น ผสมนมสด เนื้อเนียนละมุน หวานมัน อร่อยเย็นชื่นใจ",
    price: 35,
    categoryId: "cat1",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item4",
    name: "ปาท่องโก๋",
    description:
      "ปาท่องโก๋ทอดกรอบ เนื้อนุ่ม ทานคู่กับน้ำเต้าหู้ร้อนเข้ากันอย่างลงตัว",
    price: 10,
    categoryId: "cat2",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item5",
    name: "ขนมไข่",
    description: "ขนมไข่หอมนุ่ม ทำสดใหม่ทุกวัน รสชาติหวานกำลังดี ทานเพลิน",
    price: 15,
    categoryId: "cat2",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item6",
    name: "เต้าฮวยฟรุตสลัด",
    description:
      "เต้าฮวยเนื้อนุ่ม ราดด้วยน้ำเชื่อมหอมหวาน เสิร์ฟพร้อมผลไม้รวมตามฤดูกาล",
    price: 45,
    categoryId: "cat3",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item7",
    name: "ข้าวผัดน้ำเต้าหู้",
    description:
      "ข้าวผัดหอมๆ ใส่น้ำเต้าหู้ผัดกับผักรวม รสชาติกลมกล่อม อร่อยถูกปาก",
    price: 45,
    categoryId: "cat4",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item8",
    name: "ผัดไทยน้ำเต้าหู้",
    description:
      "ผัดไทยสูตรพิเศษ ใส่น้ำเต้าหู้แทนเต้าหู้ธรรมดา หวานมัน เปรื้อยนิดๆ",
    price: 50,
    categoryId: "cat4",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item9",
    name: "ต้มยำน้ำเต้าหู้",
    description:
      "ต้มยำรสจัดจ้าน ใส่น้ำเต้าหู้เนื้อนุ่ม เปรี้ยวเผ็ดอร่อย กินกับข้าวสวยร้อนๆ",
    price: 55,
    categoryId: "cat4",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item10",
    name: "แกงเขียวหวานน้ำเต้าหู้",
    description:
      "แกงเขียวหวานหอมกะทิ ใส่น้ำเต้าหู้และผักสด รสชาติเข้มข้น หอมใบโหระพา",
    price: 60,
    categoryId: "cat4",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item11",
    name: "น้ำเต้าหู้ทอดกรอบ",
    description: "น้ำเต้าหู้ทอดกรอบนอกนุ่มใน เสิร์ฟพร้อมน้ำจิ้มรสเด็ด",
    price: 35,
    categoryId: "cat2",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item12",
    name: "เต้าฮวยน้ำกะทิ",
    description: "เต้าฮวยเนื้อนุ่ม ราดด้วยน้ำกะทิหอมหวาน เย็นชื่นใจ",
    price: 40,
    categoryId: "cat3",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item13",
    name: "น้ำเต้าหู้มัทฉะ",
    description: "น้ำเต้าหู้รสมัทฉะ หอมชาเขียว หวานมัน เข้มข้น",
    price: 40,
    categoryId: "cat1",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
  {
    id: "item14",
    name: "ไอศกรีมน้ำเต้าหู้",
    description: "ไอศกรีมน้ำเต้าหู้เนื้อเนียนนุ่ม รสชาติเข้มข้น เย็นชื่นใจ",
    price: 35,
    categoryId: "cat3",
    imageUrl: "/placeholder.svg?height=300&width=300",
    isAvailable: true,
  },
];

// Helper function to create a mock session
const getMockSession = (sessionId: string): SessionData => {
  const [branchId, tableId] = sessionId.split("_");
  return {
    id: sessionId,
    branchId,
    tableId,
    tableName: `โต๊ะ ${tableId}`,
    branchName:
      branchId === "branch1"
        ? "สาขาตลาดเมืองใหม่"
        : branchId === "branch2"
        ? "สาขาตลาดใน"
        : branchId === "branch3"
        ? "สาขาหาดใหญ่"
        : "สาขาไม่ทราบชื่อ",
  };
};

// Mock orders history (will be dynamically populated)
const mockOrdersHistory: { [key: string]: Order[] } = {};

export const orderService = {
  // Get session data for a table
  getSession: async (sessionId: string): Promise<SessionResponse> => {
    try {
      // In a real app, we would call the API:
      // const response = await api.get(`/sessions/${sessionId}`);
      // return response.data;

      // For now, simulate API call with mock data
      return await new Promise((resolve) => {
        setTimeout(() => {
          const session = getMockSession(sessionId);
          resolve({ session });
        }, 300);
      });
    } catch (error) {
      console.error("Failed to fetch session:", error);
      throw error;
    }
  },

  // Get menu categories
  getMenuCategories: async (): Promise<MenuCategoriesResponse> => {
    try {
      // In a real app:
      // const response = await api.get('/menu/categories');
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ categories: mockCategories });
        }, 300);
      });
    } catch (error) {
      console.error("Failed to fetch menu categories:", error);
      throw error;
    }
  },

  // Get menu items, optionally filtered by category
  getMenuItems: async (categoryId?: string): Promise<MenuItemsResponse> => {
    try {
      // In a real app:
      // const response = await api.get('/menu/items', { params: { categoryId } });
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          let filteredItems = [...mockMenuItems];

          if (categoryId) {
            filteredItems = filteredItems.filter(
              (item) => item.categoryId === categoryId
            );
          }

          resolve({ items: filteredItems });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      throw error;
    }
  },

  // Get order history for a session
  getOrderHistory: async (sessionId: string): Promise<OrderHistoryResponse> => {
    try {
      // In a real app:
      // const response = await api.get(`/orders/history/${sessionId}`);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const sessionOrders = mockOrdersHistory[sessionId] || [];

          // If no orders exist yet, create a mock initial order
          if (sessionOrders.length === 0) {
            const mockHistory: Order[] = [
              {
                id: `order_${Date.now() - 1800000}`,
                items: [
                  {
                    id: "item1",
                    name: "น้ำเต้าหู้ร้อน",
                    description: mockMenuItems[0].description,
                    price: 25,
                    categoryId: "cat1",
                    imageUrl: mockMenuItems[0].imageUrl,
                    quantity: 2,
                    note: "หวานน้อย",
                  },
                  {
                    id: "item4",
                    name: "ปาท่องโก๋",
                    description: mockMenuItems[3].description,
                    price: 10,
                    categoryId: "cat2",
                    imageUrl: mockMenuItems[3].imageUrl,
                    quantity: 1,
                    note: "",
                  },
                ],
                status: "served",
                total: 60,
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                userName: "ลูกค้า",
              },
            ];

            mockOrdersHistory[sessionId] = mockHistory;
          }

          resolve({ orders: mockOrdersHistory[sessionId] || [] });
        }, 500);
      });
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      throw error;
    }
  },

  // Submit a new order
  submitOrder: async (
    request: SubmitOrderRequest
  ): Promise<SubmitOrderResponse> => {
    try {
      // In a real app:
      // const response = await api.post('/orders', request);
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const newOrder: Order = {
            id: `order_${Date.now()}`,
            items: request.items,
            status: "pending",
            total: request.total,
            createdAt: new Date().toISOString(),
            userName: request.userName,
          };

          // Initialize the session's order history if it doesn't exist
          if (!mockOrdersHistory[request.sessionId]) {
            mockOrdersHistory[request.sessionId] = [];
          }

          // Add to mock orders history
          mockOrdersHistory[request.sessionId] = [
            newOrder,
            ...mockOrdersHistory[request.sessionId],
          ];

          // Update status after a delay (simulating the kitchen processing)
          setTimeout(() => {
            const orderIndex = mockOrdersHistory[request.sessionId].findIndex(
              (order) => order.id === newOrder.id
            );

            if (orderIndex >= 0) {
              mockOrdersHistory[request.sessionId][orderIndex].status =
                "preparing";

              // Update to served after another delay
              setTimeout(() => {
                if (mockOrdersHistory[request.sessionId][orderIndex]) {
                  mockOrdersHistory[request.sessionId][orderIndex].status =
                    "served";
                }
              }, 10000);
            }
          }, 5000);

          resolve({ order: newOrder });
        }, 800);
      });
    } catch (error) {
      console.error("Failed to submit order:", error);
      throw error;
    }
  },

  // Search menu items
  searchMenuItems: async (query: string): Promise<MenuItemsResponse> => {
    try {
      // In a real app:
      // const response = await api.get('/menu/search', { params: { query } });
      // return response.data;

      return await new Promise((resolve) => {
        setTimeout(() => {
          const filteredItems = mockMenuItems.filter(
            (item) =>
              query === "" ||
              item.name.toLowerCase().includes(query.toLowerCase())
          );

          resolve({ items: filteredItems });
        }, 300);
      });
    } catch (error) {
      console.error("Failed to search menu items:", error);
      throw error;
    }
  },
};
