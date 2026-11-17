import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Static assets & public bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api") ||
    pathname.includes("favicon.ico") ||
    pathname.includes(".png") ||
    pathname.includes(".jpeg") ||
    pathname.includes(".svg") ||
    pathname.includes(".webp")
  ) {
    return res;
  }

  // Root route "/" always redirects to "/login"
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseConfig();

  // If Supabase environment variables are missing, allow login page and redirect protected routes
  if (!isConfigured) {
    if (pathname.startsWith("/login")) {
      return res;
    }
    const isProtectedRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/customers") ||
      pathname.startsWith("/quotations") ||
      pathname.startsWith("/invoices") ||
      pathname.startsWith("/purchase-orders") ||
      pathname.startsWith("/work-completion") ||
      pathname.startsWith("/work-completion-reports") ||
      pathname.startsWith("/team") ||
      pathname.startsWith("/settings");

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  // Check auth user
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  // Login page handling:
  // In development, always allow viewing /login so it acts as the fresh entry screen.
  // In production, if an active session exists, redirect to /dashboard.
  if (pathname.startsWith("/login")) {
    if (user && process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return res;
  }

  // Protected application routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/quotations") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/purchase-orders") ||
    pathname.startsWith("/work-completion") ||
    pathname.startsWith("/work-completion-reports") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/settings");

  if (isProtectedRoute && !user) {
    // If not authenticated, redirect to /login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
