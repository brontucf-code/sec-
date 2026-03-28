import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { postService } from "@/lib/services/post-service";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; slug: string }> }): Promise<Metadata> {
  const { siteKey, slug } = await params;
  const site = await prisma.site.findUnique({ where: { siteKey } });
  if (!site) return {};
  const post = await prisma.post.findFirst({ where: { slug, postSites: { some: { siteId: site.id } } } });
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || "",
    openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || "" }
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await prisma.site.findUnique({ where: { siteKey } });
  if (!site) return notFound();

  const post = await prisma.post.findFirst({
    where: { slug, postSites: { some: { siteId: site.id } } },
    include: {
      category: true,
      regulator: true,
      postTags: { include: { tag: true } }
    }
  });
  if (!post) return notFound();

  const related = await postService.relatedBySite(site.id, post.id);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1>{post.title}</h1>
      <p>
        {post.category && <a href={`/${siteKey}/categories/${post.category.slug}`}>分类：{post.category.name}</a>}
        {post.category && post.regulator && " | "}
        {post.regulator && <a href={`/${siteKey}/regulators/${post.regulator.code}`}>监管：{post.regulator.name}</a>}
      </p>
      {post.postTags.length > 0 && (
        <p>
          标签：
          {post.postTags.map((pt, idx) => (
            <span key={pt.tagId}>
              {idx > 0 ? "、" : ""}
              <a href={`/${siteKey}/tags/${pt.tag.slug}`}>{pt.tag.name}</a>
            </span>
          ))}
        </p>
      )}
      <article style={{ whiteSpace: "pre-wrap" }}>{post.content}</article>
      <section>
        <h3>相关推荐</h3>
        <ul>
          {related.map((r) => (
            <li key={r.id}>
              <a href={`/${siteKey}/posts/${r.slug}`}>{r.title}</a>
            </li>
          ))}
        </ul>
      </section>
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: post.faq ?? [] })}
      </script>
    </div>
  );
}
