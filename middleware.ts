// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   // ป้องกันเส้นทาง admin
//   if (request.nextUrl.pathname.startsWith("/dashboard")) {
//     // ตรวจสอบการเข้าสู่ระบบจาก token หรือ session
//     const isAuthenticated = request.cookies.has("auth_token");

//     if (!isAuthenticated) {
//       // ถ้ายังไม่ได้ login ให้ redirect ไปหน้า login
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };
