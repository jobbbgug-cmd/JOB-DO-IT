import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/c/:path*', '/dashboard/:path*', '/company/:path*'],
};
