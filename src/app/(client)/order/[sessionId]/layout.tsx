import { Noto_Sans_Thai } from "next/font/google";
import { Toaster } from "sonner";

// Configure Thai font for client pages
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-sans-thai",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "สั่งอาหาร | น้ำเต้าหู้พัทลุง",
  description: "หน้าสั่งอาหารสำหรับลูกค้า",
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${notoSansThai.variable} font-sans min-h-screen bg-background`}
    >
      {/* หน้า Order ไม่จำเป็นต้องมี auth ตามที่กำหนด */}
      <main className="flex-1">{children}</main>

      {/* Toaster สำหรับแสดงการแจ้งเตือน */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
