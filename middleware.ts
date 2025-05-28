import { usePathname } from 'next/navigation';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import path from 'path';
import { useEffect, useState } from 'react';

export function middleware(request: NextRequest) {
    // const pathname = usePathname();\
    const pathname = request.nextUrl.pathname;
    const isAuthenticated = request.cookies.has('auth_token');
    const statusCookie = request.cookies.get('user-status');
    const status = statusCookie?.value; 
    if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgotpassword') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // if (isAuthenticated && (pathname.startsWith("/login") || pathname.startsWith('/signup') ||  pathname === "/")) {
    //   return NextResponse.redirect(new URL('/dashboard/home', request.url));
    // }
    if (status !== null) {
      if (isAuthenticated && status === "1" && (pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname.startsWith("/dashboard"))) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }else if(isAuthenticated && status === "2" && (pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname.startsWith("/admin"))){
        return NextResponse.redirect(new URL('/dashboard/home', request.url));
      }
      else{
        return NextResponse.next()
      }
    }
  return NextResponse.next();
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};