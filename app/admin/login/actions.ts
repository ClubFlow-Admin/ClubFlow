"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, getAdminPassword } from "@/lib/admin-auth";

export async function signInAdmin(formData: FormData) {
  const password = getAdminPassword();
  const submittedPassword = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!password || submittedPassword !== password) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
