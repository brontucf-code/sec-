import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { seoService } from "@/lib/services/seo-service";
import { getSiteByKey, getPublishedPostBySlug } from "@/lib/site-frontend";
import { autoLinkHtml } from "@/lib/internal-linking";
import { ConversionCta } from "@/components/site/conversion-cta";

function formatDate(value: Date | null) {
  if (!value) return "未发布";
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(value);
}

function buildStructuredSections(rawContent: string, siteKey: string) {
  const lines = rawContent.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const hasSubHeading = lines.some((line) => /^#{2,3}\s/.test(line));

  if (!hasSubHeading) {
    return [
      { type: "h2" as const, text: "核心解析" },
      ...lines.map((line) => ({ type: "p" as const, text: line }))
    ];
  }

  return lines.map((line) => {
    if (line.startsWith("### ")) return { type: "h3" as const, text: line.replace(/^###\s+/, "") };
    if (line.startsWith("## ")) return { type: "h2" as const, text: line.replace(/^##\s+/, "") };
    return { type: "p" as const, text: line };
  }).map((item) => (item.type === "p" ? { ...item, text: autoLinkHtml(item.text, siteKey) } : item));
}

function buildSummary(post: { excerpt: string | null; content: string }) {
  if (post.excerpt?.trim()) {
    return `总结：${post.excerpt.trim()}`;
  }
  return `总结：${post.content.slice(0, 120).trim()}${post.content.length > 120 ? "..." : ""}`;
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
  const sections = buildStructuredSections(post.content, siteKey);
  const summary = buildSummary(post);

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
  const contactEmail = `consult@${site.domain}`;

  return (
    <div className="site-shell article-shell">
      <article className="article-detail">
        <h1>{post.title}</h1>
        <p className="meta-line">发布时间：{formatDate(post.publishedAt)}</p>

        {post.excerpt ? (
          <section>
            <h2>导读</h2>
            <p>{post.excerpt}</p>
          </section>
        ) : null}

        <section>
          <h2>正文解析</h2>
          <div className="article-content">
            {sections.map((section, index) => {
              if (section.type === "h2") return <h3 key={`${section.text}-${index}`}>{section.text}</h3>;
              if (section.type === "h3") return <h4 key={`${section.text}-${index}`}>{section.text}</h4>;
              return <p key={`${section.text}-${index}`} dangerouslySetInnerHTML={{ __html: section.text }} />;
            })}
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
          <h2>结尾总结</h2>
          <p>{summary}</p>
        </section>

        <ConversionCta
          siteKey={siteKey}
          title="需要把这篇文章变成可执行申报？"
          description="我们可以根据你的主体类型和目标时间，直接输出 SEC/Form D/EDGAR/RIA 对应执行计划。"
          contactEmail={contactEmail}
          primaryLabel="查看办理服务"
        />

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
