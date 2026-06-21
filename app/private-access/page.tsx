import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSitePrivate } from "@/lib/site-auth";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PrivateAccessPage({ searchParams }: PageProps) {
  if (!isSitePrivate()) redirect("/");

  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";
  const error = params.error;

  return (
    <main className="container-shell flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Private Access</div>
          <h1 className="font-serif mt-2 text-3xl font-black">ClubFlow is currently in private development.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Enter the development password to continue.</p>

          <form method="post" action="/api/site-access" className="mt-6 grid gap-4">
            <input type="hidden" name="next" value={next} />
            <div className="grid gap-2">
              <Label htmlFor="password">Enter access password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
            </div>
            {error === "1" ? <p className="text-sm font-semibold text-primary">That password did not match.</p> : null}
            {error === "config" ? <p className="text-sm font-semibold text-primary">Private access is not configured. Contact the site administrator.</p> : null}
            <Button type="submit">Enter ClubFlow</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
