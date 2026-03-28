import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function RegulatorPage({ params }: { params: Promise<{ siteKey: string; code: string }> }) {
  const { siteKey, code } = await params;
  const site = await prisma.site.findUnique({ where: { siteKey } });
  if (!site) return notFound();

  const regulator = await prisma.regulator.findUnique({ where: { code: code.toUpperCase() } });
  if (!regulator) return notFound();

  const posts = await prisma.post.findMany({
    where: { status: "published", regulatorId: regulator.id, postSites: { some: { siteId: site.id } } },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1>监管机构：{regulator.name}</h1>
      <p>代码：{regulator.code}</p>
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
