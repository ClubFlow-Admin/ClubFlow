import { notFound } from "next/navigation";
import { EntityProfile } from "@/components/entity-profile";
import { getPersonBySlug } from "@/lib/entities";

export const dynamic = "force-dynamic";

export default async function ExecutiveProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPersonBySlug(slug);
  if (!result) notFound();

  const { entity: person, articles, moves, projects, technology, deals, timeline } = result;
  const name = `${person.firstName} ${person.lastName}`;

  const keyFacts = [
    person.title ? { label: "Title", value: person.title } : null,
    person.currentOrganization ? { label: "Organization", value: person.currentOrganization } : null,
    person.linkedInUrl ? { label: "LinkedIn", value: person.linkedInUrl } : null
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <EntityProfile
      eyebrow="Entity Intelligence / Executive"
      name={name}
      type={person.title || "Executive"}
      logoUrl={person.photoUrl}
      location={null}
      description={person.biography}
      tags={person.tags}
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
