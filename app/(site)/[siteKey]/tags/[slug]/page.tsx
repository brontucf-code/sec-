import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/site/post-list";
import { SiteShell } from "@/components/site/site-shell";
import { getPostsByTag, getSiteByKey } from "@/lib/site-frontend";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string; slug: string }> }): Promise<Metadata> {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  return { title: `标签 ${slug} | ${site.name}`, description: `标签 ${slug} 下的全部已发布文章。` };
}

export default async function TagDetailPage({ params }: { params: Promise<{ siteKey: string; slug: string }> }) {
  const { siteKey, slug } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const posts = await getPostsByTag(site.id, slug);
  if (!posts.length) return notFound();

  const hitTag = posts[0].postTags.find((item) => item.tag.slug === slug)?.tag;

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>标签：{hitTag?.name || slug}</h2>
        <PostList posts={posts} siteKey={siteKey} />
      </section>
    </SiteShell>
  );
}
