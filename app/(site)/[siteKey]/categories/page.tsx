import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteByKey, getSiteFacets } from "@/lib/site-frontend";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string }> }): Promise<Metadata> {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  return {
    title: `分类页 | ${site.name}`,
    description: `${site.name} 分类聚合页，按主题查看文章。`
  };
}

export default async function CategoryIndexPage({ params }: { params: Promise<{ siteKey: string }> }) {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const { categories } = await getSiteFacets(site.id);

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>分类页</h2>
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <Link href={`/${siteKey}/categories/${category.slug}`}>{category.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
