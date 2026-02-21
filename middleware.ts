import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle auth session refresh
  const response = await updateSession(request);

  // Check if user is trying to access protected routes
  if (pathname.startsWith("/app")) {
    const supabaseUrl = new URL(
      "/.supabase/auth/session",
      request.url
    );

    // Get auth session from cookies
    const authCookie = request.cookies.get("sb-hawagqifmushkxlusqii-auth-token");

    if (!authCookie) {
      // Redirect to login if no session
      return Response.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
