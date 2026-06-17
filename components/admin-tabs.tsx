"use client";

import Link from "next/link";
import { Database, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { signOutAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";

const tabs = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/articles/new", icon: FileText },
  { label: "Backend", href: "/admin/backend", icon: Database }
];

export function AdminTabs() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3">
      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
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
  );
}
