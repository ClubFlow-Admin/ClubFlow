import { notFound, redirect } from "next/navigation";
import { adminSectionForCategory } from "@/lib/admin-sections";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function LegacyEditArticlePage({params}:{params:Promise<{id:string}>}) { const {id}=await params; const article=await prisma.article.findUnique({where:{id},include:{category:true}}); if(!article) notFound(); const section=adminSectionForCategory(article.category.slug); if(!section) notFound(); redirect(`/admin/${section.slug}/${id}/edit`); }
