import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const publicRoutes = [
    "/", 
    "/login", 
    "/signup", 
    "/materials",
    "/about",
    "/delivery-code",
    "/careers",
    "/press",
    "/privacy",
    "/terms",
    "/escrow-policy",
    "/refund-policy",
    "/payment/success", 
    "/payment/cancel",
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith("/blog");

  // 1. Handle Public Routes
  if (isPublicRoute) {
    if (user && (pathname === "/login" || pathname === "/signup")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const role = profile?.role || "customer";
      // ✅ SAFE ROLE: Only allow known roles, default to "customer" to prevent 404s
      const safeRole = ["admin", "customer", "supplier", "driver"].includes(role) ? role : "customer";
      
      const redirectPath = safeRole === "admin" ? "/admin" : `/dashboard/${safeRole}`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return supabaseResponse;
  }

  // 2. NOT LOGGED IN - Redirect to login
  if (!user) {
    if (pathname === "/admin/login") {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 3. GET USER PROFILE
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "customer";
  // ✅ SAFE ROLE: Prevents redirects to non-existent folders like /dashboard/fleet
  const safeRole = ["admin", "customer", "supplier", "driver"].includes(userRole) ? userRole : "customer";

  console.log(`🔍 [MIDDLEWARE CHECK] Path: ${pathname} | DB Role: "${userRole}" | Safe Role Used: "${safeRole}"`);

  // 4. STRICT ADMIN ROUTES PROTECTION
  if (pathname.startsWith("/admin")) {
    if (safeRole !== "admin") {
      await supabase.auth.signOut(); 
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return supabaseResponse;
  }

  // 5. STRICT DASHBOARD ROUTE PROTECTION & REDIRECTS
  if (pathname === "/dashboard") {
    if (safeRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // ✅ This now safely redirects to /dashboard/customer, /dashboard/supplier, or /dashboard/driver
    return NextResponse.redirect(new URL(`/dashboard/${safeRole}`, request.url));
  }

  // Prevent cross-role access
  if (pathname.startsWith("/dashboard/supplier") && safeRole !== "supplier" && safeRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  if (pathname.startsWith("/dashboard/driver") && safeRole !== "driver" && safeRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }

  if (pathname.startsWith("/dashboard/customer") && safeRole !== "customer" && safeRole !== "admin") {
    return NextResponse.redirect(new URL(`/dashboard/${safeRole}`, request.url));
  }

  // ✅ ALL OTHER ROUTES - Allow access
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};