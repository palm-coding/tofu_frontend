import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/hooks/useAuth"; // เพิ่มการนำเข้า AuthProvider
import "./globals.css";
import { DM_Sans, Noto_Sans_Thai } from "next/font/google";
import { Toaster } from "sonner";

// Configure fonts
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-sans-thai",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Tofu | POS System",
  description: "Tofu POS System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${notoSansThai.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* เพิ่ม AuthProvider ครอบ children เพื่อให้ทุกหน้าเข้าถึง Context ได้ */}
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
