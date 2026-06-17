import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { signInAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdminPasswordConfigured } from "@/lib/admin-auth";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = params.next ?? "/admin";
  const hasError = params.error === "1";
  const configured = isAdminPasswordConfigured();

  return (
    <main className="container-shell flex min-h-[70vh] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-primary">Private Admin</div>
              <h1 className="text-2xl font-black">Sign in to ClubFlow</h1>
            </div>
          </div>
          {!configured ? (
            <div className="rounded-md border bg-muted p-4 text-sm leading-6 text-muted-foreground">
              Set <code>ADMIN_PASSWORD</code> in your environment to enable the admin backend.
            </div>
          ) : (
            <form action={signInAdmin} className="grid gap-4">
              <input type="hidden" name="next" value={next} />
              <div className="grid gap-2">
                <Label htmlFor="password">Admin password</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              {hasError ? <p className="text-sm font-semibold text-primary">That password did not match.</p> : null}
              <Button type="submit">Open Admin</Button>
            </form>
          )}
          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/" className="no-underline">
              Back to public site
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
