import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route access rules
const publicRoutes = ['/', '/login', '/register'];
const authRoutes = ['/login', '/register'];

// Role-based route access
const roleRoutes = {
  author: ['/author', '/submit'],
  reviewer: ['/reviewer', '/review'],
  editor: ['/editor'],
  admin: ['/admin'],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(`/${userRole}`, nextUrl));
  }

  // Redirect non-logged-in users to login for protected routes
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Check role-based access
  if (isLoggedIn && userRole) {
    const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
    const isAccessingRoleRoute = Object.entries(roleRoutes).some(
      ([role, routes]) => {
        if (role === userRole) return false; // Skip own role check
        return routes.some((route) => nextUrl.pathname.startsWith(route));
      }
    );

    if (isAccessingRoleRoute) {
      // Redirect to user's dashboard if trying to access other role's routes
      return NextResponse.redirect(new URL(`/${userRole}`, nextUrl));
    }
  }

  return NextResponse.next();
});

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
