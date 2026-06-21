export const SITE_ACCESS_COOKIE = "clubflow_site_access";
export const SITE_ACCESS_MAX_AGE = 60 * 60 * 12;

export function isSitePrivate() {
  return process.env.SITE_PRIVATE?.toLowerCase() === "true";
}

export function getSitePassword() {
  return process.env.SITE_PASSWORD ?? "";
}

export async function siteAccessTokenFor(password: string) {
  const bytes = new TextEncoder().encode(`clubflow-site-access:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function getSiteAccessToken() {
  const password = getSitePassword();
  return password ? siteAccessTokenFor(password) : "";
}
