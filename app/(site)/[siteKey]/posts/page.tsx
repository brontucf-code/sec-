import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SitePostsPage({ params }: { params: Promise<{ siteKey: string }> }) {
  const { siteKey } = await params;
  const site = await prisma.site.findUnique({ where: { siteKey } });
  if (!site) return <div>Site not found</div>;

  const posts = await prisma.post.findMany({
    where: { status: "published", postSites: { some: { siteId: site.id } } },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1>{site.name} Articles</h1>
      {posts.map((p) => (
        <article key={p.id}><h2><Link href={`/${siteKey}/posts/${p.slug}`}>{p.title}</Link></h2><p>{p.excerpt}</p></article>
      ))}
    </div>
  );
}
