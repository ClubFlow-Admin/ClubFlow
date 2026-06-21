import { notFound } from "next/navigation";
import { updateSectionContent } from "@/app/admin/section-actions";
import { AdminArticleForm } from "@/components/admin-article-form";
import { AdminStructuredForm, type StructuredFormValues } from "@/components/admin-structured-form";
import { AdminTabs } from "@/components/admin-tabs";
import { getAdminSection } from "@/lib/admin-sections";
import { getEntityTaggingOptions, getSources } from "@/lib/articles";
import { isOpenAIConfigured } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const day=(value:Date|null)=>value?.toISOString().slice(0,10);
export default async function EditSectionContentPage({params}:{params:Promise<{section:string;id:string}>}) {
  const {section:slug,id}=await params; const section=getAdminSection(slug); if(!section) notFound(); const action=updateSectionContent.bind(null,section.slug,id);
  if(section.kind==="article") { const [article,category,sources,mediaAssets,entityOptions]=await Promise.all([prisma.article.findFirst({where:{id,category:{slug:section.categorySlug}},include:{category:true,source:true,heroImage:true,clubs:true,companies:true,people:true}}),prisma.category.findUnique({where:{slug:section.categorySlug}}),getSources(),prisma.mediaAsset.findMany({orderBy:{title:"asc"}}),getEntityTaggingOptions()]); if(!article||!category) notFound(); return <Shell label={section.label}><AdminArticleForm action={action} article={article} lockedCategory={category} sources={sources} mediaAssets={mediaAssets} entityOptions={entityOptions} openAiConfigured={isOpenAIConfigured()} /></Shell>; }
  let values:StructuredFormValues|undefined;
  if(section.kind==="job") { const item=await prisma.jobPosting.findUnique({where:{id}}); if(!item) notFound(); values={id:item.id,title:item.title,clubName:item.clubName,city:item.city,state:item.state,url:item.url,description:item.description,status:item.status,postedAt:day(item.postedAt),expiresAt:day(item.expiresAt)}; }
  else if(section.kind==="executiveMove") { const item=await prisma.executiveMove.findUnique({where:{id}}); if(!item) notFound(); values={id:item.id,executive:item.executive,newRole:item.newRole,previousRole:item.previousRole,clubName:item.clubName,city:item.city,state:item.state,notes:item.notes,status:item.status,effectiveAt:day(item.effectiveAt),publishedAt:day(item.publishedAt)}; }
  else if(section.kind==="ranking") { const item=await prisma.rankingEntry.findUnique({where:{id}}); if(!item) notFound(); values={id:item.id,category:item.category,rank:item.rank,clubName:item.clubName,city:item.city,state:item.state,score:item.score,rationale:item.rationale,status:item.status,publishedAt:day(item.publishedAt)}; }
  else { const item=await prisma.podcastEpisode.findUnique({where:{id}}); if(!item) notFound(); values={id:item.id,showName:item.showName,title:item.title,description:item.description,duration:item.duration,audioUrl:item.audioUrl,comingSoon:item.comingSoon,status:item.status,publishedAt:day(item.publishedAt)}; }
  return <Shell label={section.label}><AdminStructuredForm kind={section.kind} action={action} values={values} /></Shell>;
}
function Shell({label,children}:{label:string;children:React.ReactNode}) { return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">{label} CMS</div><h1 className="font-serif mt-1 text-4xl font-black">Edit {label} Content</h1><p className="mt-2 text-sm text-muted-foreground">The content type and section assignment are locked.</p></div>{children}</main>; }
