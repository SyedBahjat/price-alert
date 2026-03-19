import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('pa_token')?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/settings') || pathname.startsWith('/history');

  if (isDashboardPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const session = await verifyToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.set('pa_token', '', { maxAge: 0 });
      return response;
    }
  }

  if (isAuthPage && token) {
    const session = await verifyToken(token);
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/history/:path*', '/login', '/signup'],
};
