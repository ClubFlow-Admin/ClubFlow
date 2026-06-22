import { notFound } from "next/navigation";
import { EntityProfile } from "@/components/entity-profile";
import { clubTypeLabel } from "@/lib/entity-options";
import { getClubBySlug } from "@/lib/entities";
import { formatLocation } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClubProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getClubBySlug(slug);
  if (!result) notFound();

  const { entity: club, articles, moves, projects, technology, deals, timeline } = result;
  const location = formatLocation(club.city, club.state) || club.location || club.country;

  const keyFacts = [
    { label: "Type", value: clubTypeLabel(club.clubType) },
    location ? { label: "Location", value: location } : null,
    club.holes ? { label: "Holes", value: String(club.holes) } : null,
    club.foundedYear ? { label: "Founded", value: String(club.foundedYear) } : null,
    club.website ? { label: "Website", value: club.website } : null
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <EntityProfile
      eyebrow="Entity Intelligence / Private Club"
      name={club.name}
      type={clubTypeLabel(club.clubType)}
      logoUrl={club.logoUrl}
      location={location}
      description={club.description}
      tags={club.tags}
      keyFacts={keyFacts}
      articles={articles}
      moves={moves}
      projects={projects}
      technology={technology}
      deals={deals}
      timeline={timeline}
    />
  );
}
