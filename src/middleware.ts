import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    const isLoggedIn = !!token;
    const isAdmin = token?.role === "ADMIN";
    const isStaff = token?.role === "STAFF";
    
    const { pathname } = req.nextUrl;
  
  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/admin", req.nextUrl));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
  
  // Staff routes protection
  if (pathname.startsWith("/staff")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/staff", req.nextUrl));
    }
    if (!isAdmin && !isStaff) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
  
  // Account routes protection
  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=" + pathname, req.nextUrl));
    }
  }
  
  // Checkout protection
  if (pathname.startsWith("/checkout")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=/checkout", req.nextUrl));
    }
  }
  
  // Auth routes - redirect to home if already logged in
  if (pathname.startsWith("/auth") && isLoggedIn) {
    if (pathname !== "/auth/logout") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
  
  return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, allow the request to proceed
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/auth/:path*",
  ],
};
