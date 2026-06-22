"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, Newspaper, X } from "lucide-react";
import { categoryNav } from "@/lib/categories";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header bg-white">
      <div className="bg-ink text-white">
        <div className="container-shell flex min-h-8 items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.16em]">
          <span>Private club market intelligence</span>
          <Link href="/newsletter" className="hidden items-center gap-1 no-underline sm:flex">The daily briefing <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
      </div>
      <div className="container-shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <div className="font-serif text-2xl font-black leading-none">ClubFlow</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Intelligence for club leaders</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/newsletter" className="hidden rounded-sm bg-primary px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-primary/90 sm:inline-flex">Get the briefing</Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <nav className="hidden border-t border-b bg-white lg:block">
        <div className="container-shell flex gap-1 overflow-x-auto py-1.5">
          {categoryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-sm px-2.5 py-2 text-xs font-bold no-underline hover:bg-muted hover:text-primary ${isActive(pathname, item.href) ? "nav-link-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {open ? (
        <div className="mobile-menu-panel border-t bg-white lg:hidden">
          <nav className="container-shell flex flex-col py-2">
            {categoryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b py-3 text-sm font-bold no-underline last:border-0 ${isActive(pathname, item.href) ? "text-primary" : "text-foreground"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/newsletter" onClick={() => setOpen(false)} className="mt-3 inline-flex items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-bold text-white no-underline">Get the briefing</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-ink text-white">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-2">
        <div><div className="font-serif text-2xl font-black">ClubFlow</div><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">What is happening across the private club industry—and why it matters to operators, boards, partners, and investors.</p></div>
        <div className="flex flex-wrap items-start gap-x-5 gap-y-2 text-sm font-semibold md:justify-end">{categoryNav.map((item) => <Link key={item.href} href={item.href} className="text-white/75 no-underline hover:text-white">{item.label}</Link>)}</div>
      </div>
    </footer>
  );
}
