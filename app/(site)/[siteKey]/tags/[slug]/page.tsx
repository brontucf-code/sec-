import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TagPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await prisma.site.findUnique({ where: { siteKey } });
  if (!site) return notFound();

  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return notFound();

  const posts = await prisma.post.findMany({
    where: { status: "published", postSites: { some: { siteId: site.id } }, postTags: { some: { tagId: tag.id } } },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1>标签：{tag.name}</h1>
      <p>站点：{site.name}</p>
      {posts.map((p) => (
        <article key={p.id}>
          <h2>
            <Link href={`/${siteKey}/posts/${p.slug}`}>{p.title}</Link>
          </h2>
          <p>{p.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
