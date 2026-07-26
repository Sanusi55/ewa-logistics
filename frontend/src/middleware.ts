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

  // ✅ PUBLIC ROUTES - Anyone can access (including all public pages)
  const publicRoutes = [
    "/", 
    "/login", 
    "/signup", 
    "/admin",
    "/materials",
    "/about",             // ✅ About Us Page
    "/delivery-code",     // ✅ Delivery Code Page
    "/careers",           // ✅ Careers Page
    "/press",             // ✅ Press/Media Page
    "/privacy",           // ✅ Privacy Policy
    "/terms",             // ✅ Terms & Conditions
    "/escrow-policy",     // ✅ Escrow Policy
    "/refund-policy",     // ✅ Refund Policy
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

  // ✅ NOT LOGGED IN - Redirect to login
  if (!user) {
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

  // ✅ ADMIN ROUTES - Only admins
  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
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