import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "clubflow_admin";

function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? "" : "clubflow-admin";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if ((!isAdminPage && !isAdminApi) || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const password = getAdminPassword();
  const isSignedIn = password && request.cookies.get(ADMIN_COOKIE)?.value === password;

  if (isSignedIn) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
