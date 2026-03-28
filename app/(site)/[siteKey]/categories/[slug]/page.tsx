import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await prisma.site.findUnique({ where: { siteKey } });
  if (!site) return notFound();

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return notFound();

  const posts = await prisma.post.findMany({
    where: { status: "published", categoryId: category.id, postSites: { some: { siteId: site.id } } },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1>分类：{category.name}</h1>
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
