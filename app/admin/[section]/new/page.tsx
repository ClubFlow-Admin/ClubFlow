import { notFound } from "next/navigation";
import { createSectionContent } from "@/app/admin/section-actions";
import { AdminArticleForm } from "@/components/admin-article-form";
import { AdminStructuredForm } from "@/components/admin-structured-form";
import { AdminTabs } from "@/components/admin-tabs";
import { getAdminSection } from "@/lib/admin-sections";
import { getSources } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function NewSectionContentPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug }=await params; const section=getAdminSection(slug); if(!section) notFound();
  const action=createSectionContent.bind(null,section.slug);
  if(section.kind==="article") { const [category,sources,mediaAssets]=await Promise.all([prisma.category.findUnique({where:{slug:section.categorySlug}}),getSources(),prisma.mediaAsset.findMany({orderBy:{title:"asc"}})]); if(!category) notFound(); return <Shell label={section.label} mode="Add New"><AdminArticleForm action={action} lockedCategory={category} sources={sources} mediaAssets={mediaAssets} /></Shell>; }
  return <Shell label={section.label} mode="Add New"><AdminStructuredForm kind={section.kind} action={action} /></Shell>;
}
function Shell({label,mode,children}:{label:string;mode:string;children:React.ReactNode}) { return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">{label} CMS</div><h1 className="font-serif mt-1 text-4xl font-black">{mode} {label} Content</h1><p className="mt-2 text-sm text-muted-foreground">This workflow is locked to {label}. The content cannot be assigned to another section.</p></div>{children}</main>; }
