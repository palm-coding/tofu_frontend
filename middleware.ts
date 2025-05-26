// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // ทดสอบ middleware อย่างเรียบง่าย
// export function middleware(request: NextRequest) {
//   console.log("SIMPLE MIDDLEWARE RUNNING", request.nextUrl.pathname);

//   // ถ้าเป็นเส้นทาง /branches ให้ redirect ไปที่ /login
//   if (request.nextUrl.pathname === "/branches") {
//     console.log("REDIRECT TO LOGIN");
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

// // ระบุ matcher อย่างเฉพาะเจาะจง
// export const config = {
//   matcher: ["/branches"],
// };
