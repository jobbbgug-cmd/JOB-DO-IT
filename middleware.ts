import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/verify', '/api/auth/login', '/api/auth/register', '/api/auth/verify', '/api/auth/verify-dev', '/'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes (they manage auth internally)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Protected routes require token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|logo.png).*)',
  ],
};
