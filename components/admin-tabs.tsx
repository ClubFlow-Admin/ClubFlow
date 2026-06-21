"use client";

import Link from "next/link";
import { Database, LayoutDashboard, LogOut, Rss } from "lucide-react";
import { signOutAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { adminSections } from "@/lib/admin-sections";

const utilityTabs = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Sources", href: "/admin/sources", icon: Rss },
  { label: "Backend", href: "/admin/backend", icon: Database }
];

export function AdminTabs() {
  return (
    <div className="mb-6 rounded-lg border bg-white p-3">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
      <nav className="flex flex-wrap gap-2">
        {utilityTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold no-underline hover:border-primary hover:text-primary"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAdmin}>
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </form>
      </div>
      <nav className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {adminSections.map((section) => (
          <Link key={section.slug} href={`/admin/${section.slug}`} className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-bold no-underline hover:bg-muted hover:text-primary">
            {section.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
