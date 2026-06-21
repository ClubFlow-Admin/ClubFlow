import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { categoryNav } from "@/lib/categories";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClubFlow",
  description: "Private club industry news and intelligence."
};

const criticalStyles = `
  :root {
    --cf-bg: #fbfaf7;
    --cf-fg: #171d28;
    --cf-card: #ffffff;
    --cf-primary: #0b5b4d;
    --cf-primary-fg: #ffffff;
    --cf-muted: #eef2f5;
    --cf-muted-fg: #5a6472;
    --cf-border: #d7dee6;
  }
  * { box-sizing: border-box; border-color: var(--cf-border); }
  html { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  body { margin: 0; background: var(--cf-bg); color: var(--cf-fg); -webkit-font-smoothing: antialiased; }
  a { color: inherit; text-decoration: none; }
  input, select, textarea, button { font: inherit; }
  .container-shell { width: 100%; max-width: 80rem; margin-inline: auto; padding-inline: 1rem; }
  .bg-white { background: #fff; }
  .bg-muted { background: var(--cf-muted); }
  .bg-background { background: var(--cf-bg); }
  .bg-card { background: var(--cf-card); }
  .bg-primary { background: var(--cf-primary); }
  .bg-primary\\/10 { background: rgba(11, 91, 77, .1); }
  .bg-secondary { background: #edf2f7; }
  .text-primary { color: var(--cf-primary); }
  .text-primary-foreground { color: var(--cf-primary-fg); }
  .text-muted-foreground { color: var(--cf-muted-fg); }
  .text-card-foreground { color: var(--cf-fg); }
  .text-secondary-foreground { color: var(--cf-fg); }
  .border { border: 1px solid var(--cf-border); }
  .border-b { border-bottom: 1px solid var(--cf-border); }
  .border-l-4 { border-left: 4px solid var(--cf-primary); }
  .border-primary\\/25, .border-primary\\/30 { border-color: rgba(11, 91, 77, .28); }
  .border-input { border-color: var(--cf-border); }
  .rounded-sm { border-radius: .25rem; }
  .rounded-md { border-radius: .375rem; }
  .rounded-lg { border-radius: .5rem; }
  .shadow-sm { box-shadow: 0 1px 2px rgba(15, 23, 42, .08); }
  .flex { display: flex; }
  .inline-flex { display: inline-flex; }
  .block { display: block; }
  .grid { display: grid; }
  .hidden { display: none; }
  .inline { display: inline; }
  .table { display: table; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .pointer-events-none { pointer-events: none; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .flex-col { flex-direction: column; }
  .flex-wrap { flex-wrap: wrap; }
  .gap-1 { gap: .25rem; }
  .gap-2 { gap: .5rem; }
  .gap-3 { gap: .75rem; }
  .gap-4 { gap: 1rem; }
  .gap-5 { gap: 1.25rem; }
  .gap-6 { gap: 1.5rem; }
  .gap-8 { gap: 2rem; }
  .gap-0 { gap: 0; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .min-h-16 { min-height: 4rem; }
  .min-h-28 { min-height: 7rem; }
  .h-3\\.5 { height: .875rem; }
  .h-4 { height: 1rem; }
  .h-5 { height: 1.25rem; }
  .h-9 { height: 2.25rem; }
  .h-10 { height: 2.5rem; }
  .h-11 { height: 2.75rem; }
  .h-40 { height: 10rem; }
  .h-\\[320px\\] { height: 320px; }
  .h-\\[360px\\] { height: 360px; }
  .h-full { height: 100%; }
  .h-fit { height: fit-content; }
  .min-h-\\[180px\\] { min-height: 180px; }
  .w-3\\.5 { width: .875rem; }
  .w-4 { width: 1rem; }
  .w-5 { width: 1.25rem; }
  .w-9 { width: 2.25rem; }
  .w-10 { width: 2.5rem; }
  .w-full { width: 100%; }
  .min-w-max { min-width: max-content; }
  .min-w-\\[900px\\] { min-width: 900px; }
  .max-w-3xl { max-width: 48rem; }
  .max-w-4xl { max-width: 56rem; }
  .mb-2 { margin-bottom: .5rem; }
  .mb-3 { margin-bottom: .75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-5 { margin-bottom: 1.25rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mr-2 { margin-right: .5rem; }
  .mt-1 { margin-top: .25rem; }
  .mt-2 { margin-top: .5rem; }
  .mt-3 { margin-top: .75rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-5 { margin-top: 1.25rem; }
  .mt-6 { margin-top: 1.5rem; }
  .mt-8 { margin-top: 2rem; }
  .p-0 { padding: 0; }
  .p-3 { padding: .75rem; }
  .p-4 { padding: 1rem; }
  .p-5 { padding: 1.25rem; }
  .p-6 { padding: 1.5rem; }
  .p-8 { padding: 2rem; }
  .px-2 { padding-inline: .5rem; }
  .px-3 { padding-inline: .75rem; }
  .px-4 { padding-inline: 1rem; }
  .px-5 { padding-inline: 1.25rem; }
  .py-0\\.5 { padding-block: .125rem; }
  .py-1 { padding-block: .25rem; }
  .py-2 { padding-block: .5rem; }
  .py-3 { padding-block: .75rem; }
  .py-4 { padding-block: 1rem; }
  .py-8 { padding-block: 2rem; }
  .py-10 { padding-block: 2.5rem; }
  .pt-0 { padding-top: 0; }
  .pl-9 { padding-left: 2.25rem; }
  .left-3 { left: .75rem; }
  .top-2\\.5 { top: .625rem; }
  .text-left { text-align: left; }
  .text-center { text-align: center; }
  .text-xs { font-size: .75rem; line-height: 1rem; }
  .text-sm { font-size: .875rem; line-height: 1.25rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }
  .font-black { font-weight: 900; }
  .uppercase { text-transform: uppercase; }
  .leading-none { line-height: 1; }
  .leading-tight { line-height: 1.25; }
  .leading-snug { line-height: 1.375; }
  .leading-6 { line-height: 1.5rem; }
  .leading-7 { line-height: 1.75rem; }
  .leading-8 { line-height: 2rem; }
  .no-underline { text-decoration: none; }
  .whitespace-nowrap { white-space: nowrap; }
  .overflow-hidden { overflow: hidden; }
  .overflow-x-auto { overflow-x: auto; }
  .object-cover { object-fit: cover; }
  .space-y-2 > * + * { margin-top: .5rem; }
  .space-y-1\\.5 > * + * { margin-top: .375rem; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  .last\\:border-0:last-child { border-width: 0; }
  .hover\\:bg-muted:hover { background: var(--cf-muted); }
  .hover\\:bg-primary\\/90:hover { background: #094c41; }
  .hover\\:bg-secondary\\/80:hover { background: #e1e8ef; }
  .hover\\:text-foreground:hover { color: var(--cf-fg); }
  .hover\\:text-primary:hover { color: var(--cf-primary); }
  .hover\\:border-primary:hover { border-color: var(--cf-primary); }
  .group:hover .group-hover\\:text-primary { color: var(--cf-primary); }
  input, select, textarea {
    border: 1px solid var(--cf-border);
    background: var(--cf-bg);
    color: var(--cf-fg);
  }
  button, [role="button"] { cursor: pointer; }
  table { border-collapse: collapse; width: 100%; }
  th, td { vertical-align: top; }
  @media (min-width: 640px) {
    .container-shell { padding-inline: 1.5rem; }
    .sm\\:inline-flex { display: inline-flex; }
    .sm\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .sm\\:flex-row { flex-direction: row; }
    .sm\\:self-center { align-self: center; }
    .sm\\:p-8 { padding: 2rem; }
    .sm\\:text-5xl { font-size: 3rem; line-height: 1; }
  }
  @media (min-width: 768px) {
    .md\\:col-span-2 { grid-column: span 2 / span 2; }
    .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .md\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .md\\:grid-cols-\\[220px_1fr\\] { grid-template-columns: 220px 1fr; }
  }
  @media (min-width: 1024px) {
    .container-shell { padding-inline: 2rem; }
    .lg\\:grid-cols-\\[1\\.45fr_0\\.75fr\\] { grid-template-columns: 1.45fr .75fr; }
    .lg\\:grid-cols-\\[1\\.15fr_0\\.95fr\\] { grid-template-columns: 1.15fr .95fr; }
    .lg\\:grid-cols-\\[1fr_320px\\] { grid-template-columns: 1fr 320px; }
    .lg\\:grid-cols-\\[1fr_360px\\] { grid-template-columns: 1fr 360px; }
  }
  @media (min-width: 1280px) {
    .xl\\:flex { display: flex; }
  }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
      </head>
      <body>
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
            <Link href="/newsletter" className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-white no-underline">Get the briefing</Link>
          </div>
          <nav className="border-t border-b bg-white">
            <div className="container-shell flex gap-1 overflow-x-auto py-1.5">
              {categoryNav.map((item) => (
                <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-sm px-2.5 py-2 text-xs font-bold no-underline hover:bg-muted hover:text-primary">{item.label}</Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-12 border-t bg-ink text-white">
          <div className="container-shell grid gap-8 py-10 md:grid-cols-2">
            <div><div className="font-serif text-2xl font-black">ClubFlow</div><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">What is happening across the private club industry—and why it matters to operators, boards, partners, and investors.</p></div>
            <div className="flex flex-wrap items-start gap-x-5 gap-y-2 text-sm font-semibold md:justify-end">{categoryNav.map((item) => <Link key={item.href} href={item.href} className="text-white/75 no-underline hover:text-white">{item.label}</Link>)}</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
