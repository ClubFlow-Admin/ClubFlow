import { NewsletterForm } from "@/components/newsletter-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsletterPage() {
  return (
    <main className="container-shell py-10">
      <div className="max-w-3xl">
        <div className="text-xs font-bold uppercase text-primary">Newsletter</div>
        <h1 className="mt-2 text-4xl font-black">Daily and weekly private club intelligence.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Join the early ClubFlow list. Future editions will include short AI summaries and read-more links back to the
          ClubFlow article pages.
        </p>
      </div>
      <Card className="mt-8 max-w-3xl">
        <CardContent className="p-6">
          <NewsletterForm />
        </CardContent>
      </Card>
    </main>
  );
}
