import { notFound } from "next/navigation";
import { EntityProfile } from "@/components/entity-profile";
import { companyIndustryLabel } from "@/lib/entity-options";
import { getCompanyBySlug } from "@/lib/entities";

export const dynamic = "force-dynamic";

export default async function ArchitectProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getCompanyBySlug(slug);
  if (!result || result.entity.industry !== "architecture-design") notFound();

  const { entity: company, articles, moves, projects, technology, deals, timeline } = result;

  const keyFacts = [
    { label: "Type", value: "Architecture Firm" },
    company.headquarters ? { label: "Headquarters", value: company.headquarters } : null,
    company.website ? { label: "Website", value: company.website } : null
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <EntityProfile
      eyebrow="Entity Intelligence / Architecture Firm"
      name={company.name}
      type={companyIndustryLabel(company.industry)}
      logoUrl={company.logoUrl}
      location={company.headquarters}
      description={company.description}
      tags={company.tags}
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
