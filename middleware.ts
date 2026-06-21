import { NextResponse, type NextRequest } from "next/server";
import { getSiteAccessToken, isSitePrivate, SITE_ACCESS_COOKIE } from "@/lib/site-auth";

const ADMIN_COOKIE = "clubflow_admin";

function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? "" : "clubflow-admin";
}

function withoutPublicChrome(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-clubflow-hide-site-chrome", "1");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname === "/api/admin" || pathname.startsWith("/api/admin/");

  if (isAdminPage || isAdminApi) {
    if (pathname === "/admin/login") {
      return isSitePrivate() ? withoutPublicChrome(request) : NextResponse.next();
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

  if (pathname === "/private-access") {
    return withoutPublicChrome(request);
  }

  if (pathname === "/api/site-access" || !isSitePrivate()) {
    return NextResponse.next();
  }

  const accessToken = await getSiteAccessToken();
  const hasAccess = accessToken && request.cookies.get(SITE_ACCESS_COOKIE)?.value === accessToken;

  if (hasAccess) {
    return NextResponse.next();
  }

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Private site access required." }, { status: 401 });
  }

  const accessUrl = new URL("/private-access", request.url);
  accessUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
