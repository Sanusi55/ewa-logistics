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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ✅ PUBLIC ROUTES - Anyone can access (including payment redirects)
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
    "/payment/success", // ✅ ADDED: Allow payment success page to always load
    "/payment/cancel",  // ✅ ADDED: Allow payment cancel page to always load
  ];
  
  // ✅ Check if route is public OR if it's a blog post (/blog/anything)
  const isPublicRoute = publicRoutes.some(route => pathname === route) || pathname.startsWith("/blog");

  if (isPublicRoute) {
    // If logged in and trying to access login/signup, redirect based on role
    if (user && (pathname === "/login" || pathname === "/signup")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // ✅ NOT LOGGED IN - Redirect to login, BUT allow access to /admin/login
  if (!user) {
    if (pathname === "/admin/login") {
      return supabaseResponse; // Allow unauthenticated users to see the admin login page
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ GET USER PROFILE
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "customer";

  // ✅ STRICT ADMIN ROUTES PROTECTION
  if (pathname.startsWith("/admin")) {
    // 1. If they are NOT an admin, forcefully sign them out and kick them to the main login
    if (userRole !== "admin") {
      await supabase.auth.signOut(); 
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // 2. If they ARE an admin, but they try to visit the /admin/login page, send them to the dashboard
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // 3. Otherwise, allow access to /admin routes
    return supabaseResponse;
  }

  // ✅ ROLE-BASED REDIRECTS for /dashboard
  if (pathname === "/dashboard") {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return supabaseResponse;
  }

  // ✅ ALL OTHER ROUTES - Allow access
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};