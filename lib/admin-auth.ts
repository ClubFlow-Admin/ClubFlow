import { cookies } from "next/headers";

export const ADMIN_COOKIE = "clubflow_admin";

export function getAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? "" : "clubflow-admin";
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

export async function isAdminSignedIn() {
  const password = getAdminPassword();
  if (!password) return false;

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === password;
}
