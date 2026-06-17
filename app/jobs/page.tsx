import { format } from "date-fns";
import { BriefcaseBusiness } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatLocation } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await prisma.jobPosting.findMany({ orderBy: { postedAt: "desc" } });

  return (
    <main className="container-shell py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Club Jobs</h1>
          <p className="text-muted-foreground">A simple foundation for future job intelligence and hiring signals.</p>
        </div>
      </div>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-5">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                {format(job.postedAt, "MMM d, yyyy")} · {formatLocation(job.city, job.state)}
              </div>
              <h2 className="mt-2 text-xl font-black">{job.title}</h2>
              <div className="mt-1 font-semibold text-primary">{job.clubName}</div>
              {job.description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{job.description}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
