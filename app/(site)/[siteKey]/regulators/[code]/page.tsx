import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/site/post-list";
import { SiteShell } from "@/components/site/site-shell";
import { getPostsByRegulator, getSiteByKey } from "@/lib/site-frontend";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; code: string }> }): Promise<Metadata> {
  const { siteKey, code } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  return { title: `监管机构 ${code} | ${site.name}`, description: `监管机构 ${code} 相关已发布文章。` };
}

export default async function RegulatorDetailPage({ params }: { params: Promise<{ siteKey: string; code: string }> }) {
  const { siteKey, code } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const posts = await getPostsByRegulator(site.id, code);
  if (!posts.length) return notFound();

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>监管机构：{posts[0].regulator?.name || code}</h2>
        <PostList posts={posts} siteKey={siteKey} />
      </section>
    </SiteShell>
  );
}
