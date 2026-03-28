import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/site/post-list";
import { SiteShell } from "@/components/site/site-shell";
import { getPostsByCategory, getSiteByKey } from "@/lib/site-frontend";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; slug: string }> }): Promise<Metadata> {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  return {
    title: `分类 ${slug} | ${site.name}`,
    description: `分类 ${slug} 下的全部已发布文章。`
  };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const posts = await getPostsByCategory(site.id, slug);
  if (!posts.length) return notFound();

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>分类：{posts[0].category?.name || slug}</h2>
        <PostList posts={posts} siteKey={siteKey} />
      </section>
    </SiteShell>
  );
}
