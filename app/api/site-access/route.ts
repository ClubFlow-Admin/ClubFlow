import { NextResponse, type NextRequest } from "next/server";
import {
  getSitePassword,
  isSitePrivate,
  SITE_ACCESS_COOKIE,
  SITE_ACCESS_MAX_AGE,
  siteAccessTokenFor
} from "@/lib/site-auth";

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "/");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function tokensMatch(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function POST(request: NextRequest) {
  if (!isSitePrivate()) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  const formData = await request.formData();
  const submittedPassword = String(formData.get("password") ?? "");
  const expectedPassword = getSitePassword();
  const next = safeNext(formData.get("next"));

  const [submittedToken, expectedToken] = await Promise.all([
    siteAccessTokenFor(submittedPassword),
    expectedPassword ? siteAccessTokenFor(expectedPassword) : Promise.resolve("")
  ]);

  if (!expectedPassword || !tokensMatch(submittedToken, expectedToken)) {
    const accessUrl = new URL("/private-access", request.url);
    accessUrl.searchParams.set("error", expectedPassword ? "1" : "config");
    accessUrl.searchParams.set("next", next);
    return NextResponse.redirect(accessUrl, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(SITE_ACCESS_COOKIE, expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_ACCESS_MAX_AGE
  });
  return response;
}
