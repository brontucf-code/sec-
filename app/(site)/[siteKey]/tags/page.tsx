import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteByKey, getSiteFacets } from "@/lib/site-frontend";

export async function generateMetadata({ params }: { params: Promise<{ siteKey: string }> }): Promise<Metadata> {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return {};
  return { title: `标签页 | ${site.name}`, description: `${site.name} 标签聚合页。` };
}

export default async function TagIndexPage({ params }: { params: Promise<{ siteKey: string }> }) {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) return notFound();

  const { tags } = await getSiteFacets(site.id);

  return (
    <SiteShell siteKey={siteKey} siteName={site.name}>
      <section>
        <h2>标签页</h2>
        <ul>
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link href={`/${siteKey}/tags/${tag.slug}`}>#{tag.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
