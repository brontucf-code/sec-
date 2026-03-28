import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/site/post-list";
import { SiteShell } from "@/components/site/site-shell";
import { prisma } from "@/lib/prisma";
import { getSiteByKey } from "@/lib/site-frontend";

const topicMap: Record<string, { title: string; keywords: string[]; intro: string }> = {
  sec: { title: "SEC", keywords: ["sec", "securities and exchange commission"], intro: "SEC 相关政策与实务文章。" },
  "form-d": { title: "Form D", keywords: ["form d", "regulation d", "reg d"], intro: "Form D 与 Reg D 申报指南。" },
  edgar: { title: "EDGAR", keywords: ["edgar", "filing"], intro: "EDGAR 提交流程与常见问题。" },
  "ria-era": { title: "RIA / ERA", keywords: ["ria", "era", "investment adviser"], intro: "RIA/ERA 注册、合规与披露实践。" }
};

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; slug: string }> }): Promise<Metadata> {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  const topic = topicMap[slug];
  if (!topic) return {};
  return { title: `${topic.title} 栏目 | ${site.name}`, description: topic.intro };
}

export default async function TopicPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const topic = topicMap[slug];
  if (!topic) return notFound();

  const keywordFilters = topic.keywords.flatMap((keyword) => [
    { title: { contains: keyword, mode: "insensitive" as const } },
    { excerpt: { contains: keyword, mode: "insensitive" as const } },
    { content: { contains: keyword, mode: "insensitive" as const } }
  ]);

  const posts = await prisma.post.findMany({
    where: {
      status: "published",
      postSites: { some: { siteId: site.id } },
      OR: keywordFilters
    },
    include: { category: true, regulator: true, postTags: { include: { tag: true } } },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>{topic.title} 栏目</h2>
        <p>{topic.intro}</p>
        <PostList posts={posts} siteKey={siteKey} />
      </section>
    </SiteShell>
  );
}
