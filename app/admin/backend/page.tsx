import Image from "next/image";
import type * as React from "react";
import { Database, ImageIcon, Plus, Trash2 } from "lucide-react";
import {
  createCategory,
  createMediaAsset,
  createSource,
  createSubscriber,
  deleteCategory,
  deleteMediaAsset,
  deleteSource
} from "@/app/admin/backend/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BackendPage() {
  const [sources, categories, mediaAssets, subscribers] = await Promise.all([
    prisma.source.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { name: "asc" } }),
    prisma.mediaAsset.findMany({ include: { _count: { select: { articles: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 25 })
  ]);

  return (
    <main className="container-shell py-8">
      <AdminTabs />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-primary">Private Backend</div>
          <h1 className="mt-1 text-3xl font-black">Content, Sources, Photos, and Subscribers</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            This area is hidden from the public site and guarded by the admin password.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-bold">
          <Database className="h-4 w-4 text-primary" />
          Backend workspace
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Metric label="Sources" value={sources.length} />
        <Metric label="Categories" value={categories.length} />
        <Metric label="Photos" value={mediaAssets.length} />
        <Metric label="Subscribers" value={subscribers.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Media Library</h2>
                  <p className="text-sm text-muted-foreground">Add reusable lead photos for articles and section coverage.</p>
                </div>
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {mediaAssets.map((asset) => (
                  <div key={asset.id} className="overflow-hidden rounded-lg border bg-white">
                    <div className="relative h-40 w-full bg-muted">
                      <Image src={asset.url} alt={asset.altText ?? ""} fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="font-bold">{asset.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{asset.category ?? "General"} · Used by {asset._count.articles}</div>
                      {asset.caption ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{asset.caption}</p> : null}
                      <form action={deleteMediaAsset.bind(null, asset.id)} className="mt-3">
                        <Button type="submit" size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
                {!mediaAssets.length ? (
                  <div className="rounded-lg border bg-muted p-5 text-sm text-muted-foreground">No media assets yet.</div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-xl font-black">Sources</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">RSS</th>
                      <th className="px-4 py-3">Articles</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={source.id} className="border-b last:border-0">
                        <td className="px-4 py-4 font-bold">{source.name}</td>
                        <td className="px-4 py-4 text-muted-foreground">{source.rssUrl ?? "None"}</td>
                        <td className="px-4 py-4">{source._count.articles}</td>
                        <td className="px-4 py-4">
                          {source._count.articles === 0 ? (
                            <form action={deleteSource.bind(null, source.id)}>
                              <Button type="submit" size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </form>
                          ) : (
                            <span className="text-xs text-muted-foreground">In use</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-xl font-black">Categories</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {categories.map((category) => (
                  <div key={category.id} className="rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold">{category.name}</div>
                        <div className="text-xs text-muted-foreground">/{category.slug} · {category._count.articles} articles</div>
                      </div>
                      {category._count.articles === 0 ? (
                        <form action={deleteCategory.bind(null, category.id)}>
                          <Button type="submit" size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      ) : null}
                    </div>
                    {category.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="grid h-fit gap-6">
          <BackendForm title="Add Source" action={createSource}>
            <Field label="Name" name="name" required />
            <Field label="Homepage URL" name="homepageUrl" type="url" />
            <Field label="RSS URL" name="rssUrl" type="url" />
            <Area label="Notes" name="notes" />
          </BackendForm>

          <BackendForm title="Add Category" action={createCategory}>
            <Field label="Name" name="name" required />
            <Field label="Slug" name="slug" placeholder="auto-created if blank" />
            <Area label="Description" name="description" />
          </BackendForm>

          <BackendForm title="Add Photo" action={createMediaAsset}>
            <Field label="Title" name="title" required />
            <Field label="Image URL" name="url" placeholder="/images/clubhouse-hero.png" required />
            <Field label="Alt Text" name="altText" />
            <Field label="Category" name="category" placeholder="hero, renovation, technology" />
            <Field label="Credit" name="credit" />
            <Area label="Caption" name="caption" />
          </BackendForm>

          <BackendForm title="Add Subscriber" action={createSubscriber}>
            <Field label="Email" name="email" type="email" required />
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select id="frequency" name="frequency" className="h-10 rounded-md border bg-background px-3 text-sm" defaultValue="weekly">
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <input type="hidden" name="active" value="true" />
          </BackendForm>
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-black">{value}</div>
      </CardContent>
    </Card>
  );
}

function BackendForm({
  title,
  action,
  children
}: {
  title: string;
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-4 text-lg font-black">{title}</h2>
        <form action={action} className="grid gap-4">
          {children}
          <Button type="submit">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}

function Area({ label, name }: { label: string; name: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} />
    </div>
  );
}
