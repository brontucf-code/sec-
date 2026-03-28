import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostList } from "@/components/site/post-list";
import { SiteShell } from "@/components/site/site-shell";
import { ConversionCta } from "@/components/site/conversion-cta";
import { prisma } from "@/lib/prisma";
import { getSiteByKey } from "@/lib/site-frontend";

const topicMap: Record<string, { title: string; keywords: string[]; intro: string; serviceHref: string }> = {
  sec: {
    title: "SEC 专题",
    keywords: ["sec", "securities and exchange commission", "sec filing"],
    intro: "聚焦 SEC 办理路径、披露要求与提交实务，帮助团队尽快完成入场准备。",
    serviceHref: "/services/sec-filing"
  },
  "form-d": {
    title: "Form D 专题",
    keywords: ["form d", "regulation d", "reg d", "blue sky"],
    intro: "覆盖 Reg D 募资、Form D 表单字段与州级通知的核心执行知识。",
    serviceHref: "/services/form-d-filing"
  },
  edgar: {
    title: "EDGAR 专题",
    keywords: ["edgar", "cik", "ccc", "filing"],
    intro: "围绕 EDGAR 开户、权限、提交流程和常见报错提供实操指南。",
    serviceHref: "/services/edgar-account"
  },
  "ria-era": {
    title: "RIA 专题",
    keywords: ["ria", "era", "investment adviser", "form adv"],
    intro: "集中讲解 RIA/ERA 注册判断、ADV 披露与持续合规策略。",
    serviceHref: "/services/ria-era-registration"
  }
};

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; slug: string }> }): Promise<Metadata> {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  const topic = topicMap[slug];
  if (!topic) return {};
  return { title: `${topic.title} | ${site.name}`, description: topic.intro };
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

  const contactEmail = `consult@${site.domain}`;

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>{topic.title}</h2>
        <p>{topic.intro}</p>
        <p>
          需要直接落地办理？
          <Link href={`/${siteKey}${topic.serviceHref}`} className="inline-link">
            进入对应服务页
          </Link>
          获取执行方案。
        </p>
        <PostList posts={posts} siteKey={siteKey} />
      </section>

      <ConversionCta
        siteKey={siteKey}
        title="专题流量可直接转化为咨询"
        description="如果你已经确定主题方向，我们可以按专题内容给出对应申报动作与时间安排。"
        contactEmail={contactEmail}
        primaryHref={`/${siteKey}${topic.serviceHref}`}
        primaryLabel="进入对应服务"
      />
    </SiteShell>
  );
}
