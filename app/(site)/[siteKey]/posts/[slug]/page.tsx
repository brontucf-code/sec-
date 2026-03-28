import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { seoService } from "@/lib/services/seo-service";
import { getSiteByKey, getPublishedPostBySlug } from "@/lib/site-frontend";

function formatDate(value: Date | null) {
  if (!value) return "未发布";
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(value);
}

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; slug: string }> }): Promise<Metadata> {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};

  const post = await getPublishedPostBySlug(site.id, slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || "";
  const canonical = `https://${site.domain}/posts/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      publishedTime: post.publishedAt?.toISOString(),
      siteName: site.name
    }
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const post = await getPublishedPostBySlug(site.id, slug);
  if (!post) return notFound();

  const faqItems = seoService.normalizeFaq(post.faq);

  const related = await prisma.post.findMany({
    where: {
      status: "published",
      id: { not: post.id },
      postSites: { some: { siteId: site.id } },
      OR: [
        post.categoryId ? { categoryId: post.categoryId } : undefined,
        post.regulatorId ? { regulatorId: post.regulatorId } : undefined,
        post.postTags.length
          ? {
              postTags: {
                some: {
                  tagId: { in: post.postTags.map((tag) => tag.tagId) }
                }
              }
            }
          : undefined
      ].filter(Boolean) as Array<Record<string, unknown>>
    },
    orderBy: [{ publishedAt: "desc" }],
    take: 6,
    include: { category: true, regulator: true }
  });

  const canonical = `https://${site.domain}/posts/${post.slug}`;

  return (
    <div className="site-shell article-shell">
      <article className="article-detail">
        <h1>{post.title}</h1>
        <p className="meta-line">发布时间：{formatDate(post.publishedAt)}</p>
        {post.excerpt ? (
          <section>
            <h2>摘要</h2>
            <p>{post.excerpt}</p>
          </section>
        ) : null}

        <section>
          <h2>正文</h2>
          <div className="article-content" style={{ whiteSpace: "pre-wrap" }}>
            {post.content}
          </div>
        </section>

        {faqItems.length ? (
          <section>
            <h2>FAQ</h2>
            <div className="faq-list">
              {faqItems.map((faq, index) => (
                <article key={faq.question + index} className="faq-card">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2>相关推荐</h2>
          {related.length ? (
            <ul>
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={`/${siteKey}/posts/${item.slug}`}>{item.title}</Link>
                  {item.category ? ` · ${item.category.name}` : ""}
                  {item.regulator ? ` · ${item.regulator.code}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">暂无相关推荐。</p>
          )}
        </section>
      </article>

      <script
        type="application/ld+json"
        suppressHydrationWarning
      >{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt?.toISOString(),
        mainEntityOfPage: canonical,
        author: { "@type": "Organization", name: site.name }
      })}</script>

      <script
        type="application/ld+json"
        suppressHydrationWarning
      >{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
      })}</script>
    </div>
  );
}
