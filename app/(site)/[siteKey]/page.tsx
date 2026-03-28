import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLatestPublishedPosts, getSiteByKey } from "@/lib/site-frontend";
import { SiteShell } from "@/components/site/site-shell";
import { PostList } from "@/components/site/post-list";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string }> }): Promise<Metadata> {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  return {
    title: site.seoTitle || `${site.name} | SEC 内容站点`,
    description: site.seoDescription || "SEC / Form D / EDGAR / RIA ERA 内容聚合",
    alternates: { canonical: `https://${site.domain}` }
  };
}

export default async function SiteHomePage({ params }: { params: Promise<{ siteKey: string }> }) {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const posts = await getLatestPublishedPosts(site.id, 12);

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>最新文章</h2>
        <PostList posts={posts} siteKey={siteKey} />
      </section>
    </SiteShell>
  );
}
